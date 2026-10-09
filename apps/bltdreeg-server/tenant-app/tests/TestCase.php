<?php

namespace Tests;

use Illuminate\Foundation\Testing\TestCase as BaseTestCase;
use Illuminate\Support\Facades\DB;
use PDO;

abstract class TestCase extends BaseTestCase
{
    protected function setUp(): void
    {
        parent::setUp();

        $this->registerMysqlSpatialFunctions();
    }

    /**
     * Tests run on SQLite; emulate the MySQL spatial functions used in production queries.
     * POINT(x, y) is encoded as "x,y" and ST_Distance_Sphere returns metres, like MySQL.
     */
    private function registerMysqlSpatialFunctions(): void
    {
        $pdo = DB::connection()->getPdo();

        if (! $pdo instanceof PDO || $pdo->getAttribute(PDO::ATTR_DRIVER_NAME) !== 'sqlite') {
            return;
        }

        $pdo->sqliteCreateFunction('POINT', fn ($x, $y): string => "$x,$y", 2);
        $pdo->sqliteCreateFunction('ST_Distance_Sphere', function (string $a, string $b): float {
            [$lng1, $lat1] = array_map('floatval', explode(',', $a));
            [$lng2, $lat2] = array_map('floatval', explode(',', $b));

            $dLat = deg2rad($lat2 - $lat1);
            $dLng = deg2rad($lng2 - $lng1);
            $h = sin($dLat / 2) ** 2 + cos(deg2rad($lat1)) * cos(deg2rad($lat2)) * sin($dLng / 2) ** 2;

            return 6370986 * 2 * atan2(sqrt($h), sqrt(1 - $h));
        }, 2);
    }
}
