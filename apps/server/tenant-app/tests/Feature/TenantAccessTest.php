<?php

namespace Tests\Feature;

use App\Models\User;
use Bltdreeg\Core\Models\Team;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class TenantAccessTest extends TestCase
{
    use RefreshDatabase;

    public function test_user_cannot_access_foreign_tenant(): void
    {
        $ownerA = User::factory()->create(['email' => 'a@test.com']);
        $ownerB = User::factory()->create(['email' => 'b@test.com']);

        $teamA = Team::create(['name' => 'A', 'slug' => 'a', 'owner_id' => $ownerA->id]);
        $teamB = Team::create(['name' => 'B', 'slug' => 'b', 'owner_id' => $ownerB->id]);

        $teamA->users()->attach($ownerA, ['role' => 'owner']);
        $teamB->users()->attach($ownerB, ['role' => 'owner']);

        $this->assertTrue($ownerA->canAccessTenant($teamA));
        $this->assertFalse($ownerA->canAccessTenant($teamB));
    }
}
