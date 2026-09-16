<?php

namespace Bltdreeg\Core\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

#[Fillable(['name', 'description', 'permissions', 'is_active'])]
class RoleTemplate extends Model
{
    use HasFactory;

    protected static function newFactory()
    {
        return \Bltdreeg\Core\Database\Factories\RoleTemplateFactory::new();
    }

    protected function casts(): array
    {
        return [
            'permissions' => 'array',
            'is_active' => 'boolean',
        ];
    }
}
