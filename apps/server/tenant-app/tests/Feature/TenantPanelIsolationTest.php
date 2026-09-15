<?php

namespace Tests\Feature;

use App\Models\User;
use Bltdreeg\Core\Models\Team;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class TenantPanelIsolationTest extends TestCase
{
    use RefreshDatabase;

    public function test_non_member_gets_404_on_tenant_panel(): void
    {
        $ownerA = User::factory()->create(['email' => 'a@test.com']);
        $ownerB = User::factory()->create(['email' => 'b@test.com']);

        $teamA = Team::create(['name' => 'A', 'slug' => 'team-a', 'owner_id' => $ownerA->id]);
        $teamB = Team::create(['name' => 'B', 'slug' => 'team-b', 'owner_id' => $ownerB->id]);

        $teamA->users()->attach($ownerA, ['role' => 'owner']);
        $teamB->users()->attach($ownerB, ['role' => 'owner']);

        $this->actingAs($ownerA)
            ->get('/team-b')
            ->assertNotFound();
    }
}
