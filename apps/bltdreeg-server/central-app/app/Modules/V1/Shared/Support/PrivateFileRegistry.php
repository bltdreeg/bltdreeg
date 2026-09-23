<?php

declare(strict_types=1);

namespace App\Modules\V1\Shared\Support;

use Bltdreeg\Core\Contracts\PrivateStoredFile;
use InvalidArgumentException;

/**
 * Maps URL type keys → Eloquent models that implement PrivateStoredFile.
 * Modules register their types from their own service providers.
 */
final class PrivateFileRegistry
{
    /** @var array<string, class-string<PrivateStoredFile>> */
    private static array $types = [];

    /**
     * @param  class-string<PrivateStoredFile>  $modelClass
     */
    public static function register(string $type, string $modelClass): void
    {
        if (! is_subclass_of($modelClass, PrivateStoredFile::class)) {
            throw new InvalidArgumentException("{$modelClass} must implement ".PrivateStoredFile::class);
        }

        self::$types[$type] = $modelClass;
    }

    /**
     * @return class-string<PrivateStoredFile>|null
     */
    public static function modelFor(string $type): ?string
    {
        return self::$types[$type] ?? null;
    }

    public static function typeFor(string $modelClass): string
    {
        foreach (self::$types as $type => $registered) {
            if ($registered === $modelClass || is_a($modelClass, $registered, true)) {
                return $type;
            }
        }

        if (is_subclass_of($modelClass, PrivateStoredFile::class)) {
            return $modelClass::privateFileType();
        }

        throw new InvalidArgumentException("No private-file type registered for {$modelClass}");
    }

    /**
     * @return array<string, class-string<PrivateStoredFile>>
     */
    public static function all(): array
    {
        return self::$types;
    }

    /** @internal tests */
    public static function flush(): void
    {
        self::$types = [];
    }
}
