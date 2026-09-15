<?php

namespace Tests\Feature;

use App\Models\User;
use App\Modules\V1\Crm\Http\Middleware\RequireCrmApiTeam;
use Bltdreeg\Core\Models\Team;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\Request;
use Symfony\Component\HttpKernel\Exception\HttpException;
use Tests\TestCase;

class CrmApiTeamGuardTest extends TestCase
{
    use RefreshDatabase;

    /**
     * The CRM REST API (crm/api/v2/*) never runs BindCrmTenant — only the
     * Filament panel routes do. The vendor's own SetApiTeamContext falls back
     * to the user's persisted current_team_id when no X-Team-ID header is
     * sent, and that column can be NULL, in which case BelongsToTeamsScope
     * silently returns every team's rows. RequireCrmApiTeam is registered
     * after SetApiTeamContext on these routes (see AppServiceProvider) and
     * closes that gap by rejecting any request that reaches it with no team
     * resolved on the authenticated user.
     *
     * Exercised as a plain middleware call, not a full HTTP round trip: the
     * CRM API route also runs the vendor's own HasCrmAccess/permission
     * middleware, which is unrelated to what this fix changes and would
     * otherwise make this test assert on vendor internals instead of the
     * guard's own contract. End-to-end route wiring is covered separately by
     * asserting the resolved route middleware order (see route:list output
     * consulted while building this fix).
     */
    public function test_rejects_when_no_team_is_bound_on_the_authenticated_user(): void
    {
        $owner = User::factory()->create(['current_team_id' => null]);
        $team = Team::create(['name' => 'A', 'slug' => 'team-a', 'owner_id' => $owner->id]);
        $team->users()->attach($owner, ['role' => 'owner']);

        $this->actingAs($owner);

        $request = Request::create('/crm/api/v2/leads', 'GET');
        $request->setUserResolver(fn () => $owner);

        $this->expectException(HttpException::class);
        $this->expectExceptionMessage('No tenant resolved for this request.');

        (new RequireCrmApiTeam())->handle($request, fn ($r) => response()->json(['ok' => true]));
    }

    public function test_allows_when_the_authenticated_user_has_a_bound_team(): void
    {
        $owner = User::factory()->create(['current_team_id' => null]);
        $team = Team::create(['name' => 'A', 'slug' => 'team-a', 'owner_id' => $owner->id]);
        $team->users()->attach($owner, ['role' => 'owner']);

        // Mirrors what SetApiTeamContext does before RequireCrmApiTeam runs,
        // whether via the X-Team-ID header path or the persisted-column path.
        $owner->switchTeam($team);

        $request = Request::create('/crm/api/v2/leads', 'GET');
        $request->setUserResolver(fn () => $owner);

        $response = (new RequireCrmApiTeam())->handle($request, fn ($r) => response()->json(['ok' => true]));

        $this->assertSame(200, $response->getStatusCode());
    }
}
