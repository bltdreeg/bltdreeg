<?php

namespace Database\Seeders;

use Bltdreeg\Core\Modules\Tenancy\Support\DemoData;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    use WithoutModelEvents;

    public function run(): void
    {
        DemoData::seed();
    }
}
