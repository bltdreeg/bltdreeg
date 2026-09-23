<?php

require __DIR__.'/../tenant-app/vendor/autoload.php';
$app = require __DIR__.'/../tenant-app/bootstrap/app.php';
$app->make(Illuminate\Contracts\Console\Kernel::class)->bootstrap();

echo 'env: '.var_export(env('AUTH_MODEL'), true).PHP_EOL;
echo 'config: '.var_export(config('auth.providers.users.model'), true).PHP_EOL;
echo 'getenv: '.var_export(getenv('AUTH_MODEL'), true).PHP_EOL;
