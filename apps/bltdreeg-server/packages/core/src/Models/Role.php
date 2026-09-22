<?php

declare(strict_types=1);

namespace Bltdreeg\Core\Models;

use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Spatie\Permission\Models\Role as SpatieRole;

class Role extends SpatieRole
{
    protected function casts(): array
    {
        return array_merge(parent::casts(), [
            'is_system' => 'boolean',
        ]);
    }

    public function team(): BelongsTo
    {
        return $this->belongsTo(Tenant::class, config('permission.column_names.team_foreign_key', 'team_id'));
    }
}
