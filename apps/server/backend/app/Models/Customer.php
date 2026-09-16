<?php

namespace App\Models;

use App\Enums\GenderEnum;
use Database\Factories\CustomerFactory;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Override;

#[Fillable(['name', 'phone', 'email', 'password', 'gender', 'date_of_birth', 'avatar'])]
class Customer extends Model
{
    /** @use HasFactory<CustomerFactory> */
    use HasFactory;

    #[Override]
    protected function casts()
    {
        return [
            'date_of_birth' => 'date',
            'gender' => GenderEnum::class,
        ];
    }
}
