<?php

declare(strict_types=1);

namespace Bltdreeg\Core\Contracts;

/**
 * A model that stores a private file on a non-public disk and may be
 * streamed to authorized users via a short-lived signed URL.
 */
interface PrivateStoredFile
{
    /**
     * Stable URL segment for this kind of file (e.g. "tenant-legal-document").
     */
    public static function privateFileType(): string;

    public function privateDiskName(): string;

    public function privateFilePath(): string;

    public function privateDownloadName(): ?string;
}
