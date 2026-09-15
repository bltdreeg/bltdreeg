<?php

namespace App\Models;

use Bltdreeg\Core\Models\User as CoreUser;
use Database\Factories\UserFactory;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Spatie\Permission\Traits\HasRoles;
use VentureDrake\LaravelCrm\Traits\HasCrmAccess;
use VentureDrake\LaravelCrm\Traits\HasCrmTeams;

class User extends CoreUser
{
    /** @use HasFactory<UserFactory> */
    use HasFactory;
    use HasCrmAccess;
    use HasCrmTeams;
    use HasRoles;

    protected $table = 'users';

    protected static function newFactory(): UserFactory
    {
        return UserFactory::new();
    }
}
