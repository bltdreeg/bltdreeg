<?php

namespace Bltdreeg\Core\Modules\Onboarding\Models;


use Bltdreeg\Core\Modules\Auth\Models\User;
use Bltdreeg\Core\Concerns\BelongsToTenant;
use Bltdreeg\Core\Modules\Onboarding\Enums\SubmissionStatusEnum;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

/**
 * One row per onboarding attempt. Resubmissions insert a new revision instead of
 * overwriting, so reviewers can compare what changed between attempts.
 */
#[Fillable([
    'tenant_id',
    'submitted_by_user_id',
    'payload',
    'status',
    'reviewed_by_user_id',
    'reviewed_at',
    'decline_reason',
    'revision',
])]
class TenantOnboardingSubmission extends Model
{
    use BelongsToTenant;

    protected function casts(): array
    {
        return [
            'payload' => 'array',
            'status' => SubmissionStatusEnum::class,
            'reviewed_at' => 'datetime',
            'revision' => 'int',
        ];
    }

    public function submittedBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'submitted_by_user_id');
    }

    public function reviewedBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'reviewed_by_user_id');
    }

    public function legalDocuments(): HasMany
    {
        return $this->hasMany(TenantLegalDocument::class, 'submission_id');
    }

    public function isPending(): bool
    {
        return $this->status === SubmissionStatusEnum::PENDING;
    }

    public function previousRevision(): ?self
    {
        if ($this->revision <= 1) {
            return null;
        }

        return static::query()
            ->withoutGlobalScopes()
            ->where('tenant_id', $this->tenant_id)
            ->where('revision', '<', $this->revision)
            ->orderByDesc('revision')
            ->first();
    }

    /**
     * The identity document this attempt relied on — either uploaded with it or carried over.
     */
    public function legalDocument(): ?TenantLegalDocument
    {
        $documentId = $this->payload['document_id'] ?? null;

        if (! $documentId) {
            return null;
        }

        return TenantLegalDocument::query()
            ->withoutGlobalScopes()
            ->where('tenant_id', $this->tenant_id)
            ->find($documentId);
    }
}
