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

test('lists cities of a governorate', function () {
    $this->getJson('/api/v1/geo/governorates/EG01/cities', ['Accept-Language' => 'en'])
        ->assertOk()
        ->assertJsonFragment(['id' => 'EG0111', 'name' => 'Qasr Al-Nile']);
});

test('unknown parent returns 404', function () {
    $this->getJson('/api/v1/geo/governorates/EG99/cities')->assertNotFound();
});

test('resolves a point to divisions', function () {
    $this->getJson('/api/v1/geo/resolve?lat=31.2001&lng=29.9187', ['Accept-Language' => 'en'])
        ->assertOk()
        ->assertJsonPath('data.city.id', 'EG0204')
        ->assertJsonPath('data.governorate.name', 'Alexandria')
        ->assertJsonPath('data.source', 'gps');
});

test('resolve rejects points outside egypt and missing coordinates', function () {
    $this->getJson('/api/v1/geo/resolve?lat=51.5&lng=-0.12')->assertStatus(422)->assertJsonValidationErrors(['location']);
    $this->getJson('/api/v1/geo/resolve?lat=30.0')->assertStatus(422)->assertJsonValidationErrors(['lng']);
});
