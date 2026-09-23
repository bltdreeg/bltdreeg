<?php

declare(strict_types=1);

namespace App\Modules\V1\Shared\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Modules\V1\Shared\Support\PrivateFileRegistry;
use Bltdreeg\Core\Contracts\PrivateStoredFile;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\Gate;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\URL;
use Symfony\Component\HttpFoundation\StreamedResponse;

/**
 * Streams any registered PrivateStoredFile behind auth + policy + signed URL.
 * Add new file kinds by implementing PrivateStoredFile and registering the type
 * from the owning module's service provider.
 */
class PrivateFileController extends Controller
{
    public const TTL_MINUTES = 10;

    public static function temporaryUrl(PrivateStoredFile&Model $file, ?int $ttlMinutes = null): string
    {
        $type = PrivateFileRegistry::typeFor($file::class);

        return URL::temporarySignedRoute(
            'private-files.show',
            now()->addMinutes($ttlMinutes ?? self::TTL_MINUTES),
            [
                'type' => $type,
                'id' => $file->getKey(),
            ],
        );
    }

    public function __invoke(string $type, string $id): StreamedResponse
    {
        abort_unless(auth()->check(), 403);

        $modelClass = PrivateFileRegistry::modelFor($type);
        abort_unless(is_string($modelClass) && is_subclass_of($modelClass, Model::class), 404);

        /** @var Model&PrivateStoredFile $file */
        $file = $modelClass::query()->findOrFail($id);

        Gate::authorize('view', $file);

        $disk = Storage::disk($file->privateDiskName());
        $path = $file->privateFilePath();

        abort_unless($path !== '' && $disk->exists($path), 404);

        $downloadName = $file->privateDownloadName() ?: basename($path);

        return $disk->response($path, $downloadName, [
            'Cache-Control' => 'no-store, private',
            'X-Content-Type-Options' => 'nosniff',
            'Content-Security-Policy' => "default-src 'none'; img-src 'self'; style-src 'unsafe-inline'",
        ]);
    }
}
