<?php

namespace Bltdreeg\Core\Modules\Onboarding\Models;

use Bltdreeg\Core\Concerns\BelongsToTenant;
use Bltdreeg\Core\Contracts\PrivateStoredFile;
use Bltdreeg\Core\Modules\Onboarding\Enums\LegalDocumentTypeEnum;
use Bltdreeg\Core\Modules\Onboarding\Enums\SubmissionStatusEnum;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Attributes\Hidden;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

#[Fillable([
    'tenant_id',
    'submission_id',
    'type',
    'file_path',
    'original_filename',
    'status',
    'rejection_reason',
])]
#[Hidden(['file_path'])]
class TenantLegalDocument extends Model implements PrivateStoredFile
{
    use BelongsToTenant;

    public const DISK = 'identity_documents';

    public const PRIVATE_FILE_TYPE = 'tenant-legal-document';

    protected function casts(): array
    {
        return [
            'type' => LegalDocumentTypeEnum::class,
            'status' => SubmissionStatusEnum::class,
        ];
    }

    public function submission(): BelongsTo
    {
        return $this->belongsTo(TenantOnboardingSubmission::class, 'submission_id');
    }

    public static function privateFileType(): string
    {
        return self::PRIVATE_FILE_TYPE;
    }

    public function privateDiskName(): string
    {
        return self::DISK;
    }

    public function privateFilePath(): string
    {
        return (string) $this->file_path;
    }

    public function privateDownloadName(): ?string
    {
        return $this->original_filename;
    }
}
