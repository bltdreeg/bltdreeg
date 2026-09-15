<?php

namespace App\Modules\V1\Crm\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

/**
 * Fails closed where the plugin's own SetApiTeamContext fails open.
 *
 * SetApiTeamContext resolves the team from the `X-Team-ID` header when it is
 * present (and validates membership properly there), but falls back to the
 * user's persisted `current_team_id` column when the header is absent. That
 * column can be NULL — e.g. any user without it set — in which case
 * BelongsToTeamsScope::apply() silently declines to scope at all, and the
 * request sees every tenant's rows.
 *
 * This middleware is registered directly on the CRM API routes (see
 * AppServiceProvider::boot()) rather than pushed onto the vendor's `crm-api`
 * group, because that group's middleware runs *before* SetApiTeamContext on
 * these routes — appending here only would still run first. Registering
 * per-route guarantees this runs after the tenant is resolved, so it can
 * reject the request instead of letting an unscoped query through.
 */
class RequireCrmApiTeam
{
    public function handle(Request $request, Closure $next): Response
    {
        $user = $request->user();

        abort_unless($user && $user->currentTeam, 403, 'No tenant resolved for this request.');

        return $next($request);
    }
}
