<?php

use App\Models\Shop;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;

uses(RefreshDatabase::class);

test('the shops list page renders for a super admin', function () {
    $superAdmin = User::factory()->superAdmin()->create();
    $shop = Shop::factory()->create();

    $this->actingAs($superAdmin)
        ->get('/admin/'.$shop->getKey().'/shops')
        ->assertOk();
});
