<?php

declare(strict_types=1);

namespace Bltdreeg\Core\Modules\Onboarding\Support;


use Bltdreeg\Core\Modules\Auth\Models\User;
use Bltdreeg\Core\Modules\Tenancy\Enums\CurrencyEnum;
use Bltdreeg\Core\Modules\Tenancy\Enums\TenantStatusEnum;
use Bltdreeg\Core\Modules\Tenancy\Models\Tenant;
use Bltdreeg\Core\Modules\Tenancy\Support\TenantProvisioner;
use Bltdreeg\Core\Modules\Tenancy\Support\TenantSlug;
use Illuminate\Support\Facades\DB;
use SensitiveParameter;

class SalonRegistrationService
{
    public function __construct(private TenantProvisioner $provisioner) {}

    /**
     * Create a draft salon and its owner. The salon stays off the marketplace
     * (draft + inactive) until an admin approves its onboarding submission.
     *
     * @param  array{salon_name: string, slug?: ?string, owner_name: string, email: string, phone: string, password: string}  $data
     */
    public function register(#[SensitiveParameter] array $data): User
    {
        return DB::transaction(function () use ($data): User {
            // Panel URL is derived from the business name — owners never pick it.
            $slug = filled($data['slug'] ?? null)
                ? TenantSlug::generate((string) $data['slug'])
                : TenantSlug::generate($data['salon_name']);
            $acceptedAt = now();

            // TenantObserver::created provisions permissions and the owner role.
            $tenant = Tenant::query()->create([
                'name' => $data['salon_name'],
                'slug' => $slug,
                'email' => $data['email'],
                'phone' => $data['phone'],
                'address' => '',
                'currency' => CurrencyEnum::EGP,
                'is_active' => false,
                'status' => TenantStatusEnum::DRAFT,
                'terms_accepted_at' => $acceptedAt,
                'privacy_accepted_at' => $acceptedAt,
                'terms_version' => LegalTerms::VERSION,
            ]);

            return $this->provisioner->createTenantOwner(
                $tenant,
                $data['owner_name'],
                $data['email'],
                $data['password'],
                $data['phone'],
            );
        });
    }
}
