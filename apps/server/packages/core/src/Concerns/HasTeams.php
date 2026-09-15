<?php

namespace Bltdreeg\Core\Concerns;

use Bltdreeg\Core\Models\Team;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Support\Collection;

trait HasTeams
{
    public function teams(): BelongsToMany
    {
        return $this->belongsToMany(Team::class, 'team_user')
            ->withPivot('role')
            ->withTimestamps();
    }

    public function ownedTeams(): HasMany
    {
        return $this->hasMany(Team::class, 'owner_id');
    }

    public function currentTeam(): BelongsTo
    {
        return $this->belongsTo(Team::class, 'current_team_id');
    }

    public function allTeams(): Collection
    {
        return $this->teams->sortBy('name')->values();
    }

    public function belongsToTeam(Team $team): bool
    {
        return $this->teams()->whereKey($team->getKey())->exists();
    }

    /**
     * Point the user at a team for the current request without writing to the
     * database. laravel-crm's BelongsToTeamsScope reads the currentTeam
     * relation; persisting here would make concurrent sessions fight.
     */
    public function switchTeam(Team $team): void
    {
        $this->setAttribute('current_team_id', $team->getKey());
        $this->setRelation('currentTeam', $team);
    }
}
