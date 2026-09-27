<?php

use App\Modules\V1\Shared\Support\ApiV1;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

use function Pest\Laravel\getJson;
use function Pest\Laravel\postJson;

it('returns the error envelope for an unknown api path', function () {
    $response = getJson('/api/v1/does-not-exist', [
        'Accept-Language' => 'en',
    ]);

    $response->assertNotFound()
        ->assertExactJson([
            'message' => 'The requested resource was not found.',
            'code' => 'not_found',
            'data' => [],
            'errors' => [],
        ]);
});

it('returns the validation.failed envelope', function () {
    ApiV1::routes(function (): void {
        Route::post('__validation_probe', function (Request $request) {
            $request->validate([
                'field' => ['required', 'string'],
            ]);

            return response()->noContent();
        });
    });

    $response = postJson('/api/v1/__validation_probe', [], [
        'Accept-Language' => 'en',
    ]);

    $response->assertUnprocessable()
        ->assertJsonPath('code', 'validation.failed')
        ->assertJsonPath('message', 'The given data was invalid.')
        ->assertJsonPath('data', [])
        ->assertJsonStructure([
            'message',
            'code',
            'data',
            'errors' => ['field'],
        ]);
});

it('localises envelope messages from Accept-Language', function () {
    $arabic = getJson('/api/v1/does-not-exist', [
        'Accept-Language' => 'ar',
    ]);

    $arabic->assertNotFound()
        ->assertJsonPath('code', 'not_found')
        ->assertJsonPath('message', 'المورد المطلوب غير موجود.');

    $english = getJson('/api/v1/does-not-exist', [
        'Accept-Language' => 'en',
    ]);

    $english->assertNotFound()
        ->assertJsonPath('code', 'not_found')
        ->assertJsonPath('message', 'The requested resource was not found.');
});
