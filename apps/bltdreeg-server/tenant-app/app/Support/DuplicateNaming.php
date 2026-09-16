<?php

declare(strict_types=1);

namespace App\Support;

use Illuminate\Support\Str;

final class DuplicateNaming
{
    /**
     * @param  array<int, string>  $existingNames
     */
    public static function buildDuplicateName(string $sourceName, array $existingNames, int $maxLength = 255): string
    {
        $baseName = self::getBaseName($sourceName);
        $nextNumber = self::getNextNumber($baseName, $existingNames);
        $suffix = ' '.$nextNumber;

        return Str::limit($baseName, $maxLength - strlen($suffix), '').$suffix;
    }

    public static function getBaseName(string $name): string
    {
        $base = trim((string) preg_replace('/\s*\(Copy\)\s*$/i', '', $name));
        $base = trim((string) preg_replace('/\s+\d+(\s+\d+)*\s*$/', '', $base));

        return $base !== '' ? $base : $name;
    }

    /**
     * @param  array<int, string>  $existingNames
     */
    public static function getNextNumber(string $baseName, array $existingNames): int
    {
        $maxNum = 0;
        $numberedPattern = '/^'.preg_quote($baseName, '/').'\s+(\d+)\s*$/u';

        foreach ($existingNames as $name) {
            $name = (string) $name;
            if ($name === $baseName) {
                $maxNum = max($maxNum, 1);
            } elseif (preg_match($numberedPattern, $name, $m)) {
                $maxNum = max($maxNum, (int) $m[1]);
            }
        }

        return $maxNum + 1;
    }
}
