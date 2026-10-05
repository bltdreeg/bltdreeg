<?php

use Illuminate\Foundation\Testing\RefreshDatabase;

uses(RefreshDatabase::class);

test('lists governorates localized and cacheable', function () {
    $response = $this->getJson('/api/v1/geo/governorates', ['Accept-Language' => 'ar']);

    $response->assertOk()
        ->assertJsonCount(27, 'data')
        ->assertJsonFragment(['id' => 'EG01', 'name' => 'القاهرة']);

    expect($response->headers->get('Cache-Control'))->toContain('max-age=86400')->toContain('public');
});

test('lists cities of a governorate and areas of a city', function () {
    $this->getJson('/api/v1/geo/governorates/EG01/cities', ['Accept-Language' => 'en'])
        ->assertOk()
        ->assertJsonFragment(['id' => 'EG0111', 'name' => 'Qasr Al-Nile']);

    $this->getJson('/api/v1/geo/cities/EG0111/areas', ['Accept-Language' => 'en'])
        ->assertOk()
        ->assertJsonCount(4, 'data')
        ->assertJsonFragment(['id' => 'EG011102', 'name' => 'Garden City']);
});

test('a city without real areas lists its single placeholder area', function () {
    $this->getJson('/api/v1/geo/cities/EG0100/areas')
        ->assertOk()
        ->assertJsonCount(1, 'data')
        ->assertJsonPath('data.0.id', 'EG010000');
});

test('unknown parents return 404', function () {
    $this->getJson('/api/v1/geo/governorates/EG99/cities')->assertNotFound();
    $this->getJson('/api/v1/geo/cities/EG9999/areas')->assertNotFound();
});

test('resolves a point to divisions', function () {
    $this->getJson('/api/v1/geo/resolve?lat=31.2001&lng=29.9187', ['Accept-Language' => 'en'])
        ->assertOk()
        ->assertJsonPath('data.area.id', 'EG020405')
        ->assertJsonPath('data.city.id', 'EG0204')
        ->assertJsonPath('data.governorate.name', 'Alexandria')
        ->assertJsonPath('data.source', 'gps');
});

test('resolve rejects points outside egypt and missing coordinates', function () {
    $this->getJson('/api/v1/geo/resolve?lat=51.5&lng=-0.12')->assertStatus(422)->assertJsonValidationErrors(['location']);
    $this->getJson('/api/v1/geo/resolve?lat=30.0')->assertStatus(422)->assertJsonValidationErrors(['lng']);
});
