<?php

namespace Tests\Feature;

use App\Models\User;
use Bltdreeg\Core\Models\Team;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;
use VentureDrake\LaravelCrm\Models\Lead;

class CrmTeamDataIsolationTest extends TestCase
{
    use RefreshDatabase;

    /**
     * Regression test for the gap the earlier isolation tests missed: they
     * asserted panel/route access (canAccessTenant, 404s) but never asserted
     * the property that actually matters — that a user cannot see another
     * team's CRM rows.
     *
     * BelongsToTeamsScope::apply() only scopes when auth()->user()->currentTeam
     * resolves; it does not deny when it's missing, it just declines to add a
     * where() clause at all. So a user whose current_team_id is NULL sees every
     * team's rows via plain Eloquent access — this is deliberately documented
     * here, not asserted as safe, because it's exactly what makes the CRM API
     * exploitable when no team is bound (see CrmApiTeamGuardTest, and
     * RequireCrmApiTeam's docblock). BindCrmTenant closes this for Filament
     * panel requests by aborting before any query runs; nothing closes it for
     * direct Eloquent/API access without RequireCrmApiTeam.
     */
    public function test_scope_fails_open_for_a_user_with_no_bound_current_team(): void
    {
        $ownerA = User::factory()->create(['email' => 'owner-a@test.com']);
        $ownerB = User::factory()->create(['email' => 'owner-b@test.com']);
        $member = User::factory()->create(['email' => 'member@test.com', 'current_team_id' => null]);

        $teamA = Team::create(['name' => 'A', 'slug' => 'team-a', 'owner_id' => $ownerA->id]);
        $teamB = Team::create(['name' => 'B', 'slug' => 'team-b', 'owner_id' => $ownerB->id]);

        $teamA->users()->attach($ownerA, ['role' => 'owner']);
        $teamB->users()->attach($ownerB, ['role' => 'owner']);
        $teamA->users()->attach($member, ['role' => 'member']);

        Lead::query()->create(['external_id' => 'lead-a', 'team_id' => $teamA->id, 'title' => 'Team A lead']);
        Lead::query()->create(['external_id' => 'lead-b', 'team_id' => $teamB->id, 'title' => 'Team B lead']);

        $this->assertNull($member->fresh()->current_team_id);

        $this->actingAs($member);

        $this->assertSame(
            2,
            Lead::count(),
            'Unscoped access is the known, tracked risk RequireCrmApiTeam / BindCrmTenant guard against at the request layer.'
        );
    }

    public function test_user_with_bound_current_team_sees_only_own_team_rows(): void
    {
        $ownerA = User::factory()->create(['email' => 'owner-a2@test.com']);
        $ownerB = User::factory()->create(['email' => 'owner-b2@test.com']);

        $teamA = Team::create(['name' => 'A2', 'slug' => 'team-a2', 'owner_id' => $ownerA->id]);
        $teamB = Team::create(['name' => 'B2', 'slug' => 'team-b2', 'owner_id' => $ownerB->id]);

        $teamA->users()->attach($ownerA, ['role' => 'owner']);
        $teamB->users()->attach($ownerB, ['role' => 'owner']);

        Lead::query()->create(['external_id' => 'lead-a2', 'team_id' => $teamA->id, 'title' => 'Team A2 lead']);
        Lead::query()->create(['external_id' => 'lead-b2', 'team_id' => $teamB->id, 'title' => 'Team B2 lead']);

        $ownerA->switchTeam($teamA);
        $this->actingAs($ownerA);

        $leads = Lead::all();

        $this->assertCount(1, $leads);
        $this->assertSame($teamA->id, $leads->first()->team_id);
    }
}
