<?php

namespace Tests\Feature;

use App\Modules\V1\Tenants\Services\CreateTenant;
use Bltdreeg\Core\Models\Team;
use Bltdreeg\Core\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class CreateTenantTest extends TestCase
{
    use RefreshDatabase;

    public function test_creates_team_and_attaches_owner(): void
    {
        $owner = User::factory()->create();

        $team = app(CreateTenant::class)->handle('Acme', 'acme', $owner);

        $this->assertInstanceOf(Team::class, $team);
        $this->assertSame('acme', $team->slug);
        $this->assertTrue($team->users()->whereKey($owner)->exists());
        $this->assertSame($team->getKey(), $owner->fresh()->current_team_id);
    }
}
