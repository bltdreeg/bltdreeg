<?php

namespace App\Modules\V1\Customer\Auth\Support;

use Bltdreeg\Core\Modules\Customers\Models\Customer;

class OnboardingStatus
{
    /**
     * Compute the onboarding status payload for a customer.
     *
     * @return array{complete: bool, missing: array<int, string>, skippable: array<int, string>}
     */
    public static function for(Customer $customer): array
    {
        $missing = [];
        $skippable = [];

        // 1. Phone (Required)
        if (empty($customer->phone) || $customer->phone_verified_at === null) {
            $missing[] = 'phone';
        }

        // 2. Name (Required)
        if (empty($customer->first_name) || empty($customer->last_name)) {
            $missing[] = 'name';
        }

        // 3. Terms (Required)
        if ($customer->terms_accepted_at === null) {
            $missing[] = 'terms';
        }

        // 4. Location (Skippable)
        if ($customer->last_lat === null || $customer->last_lng === null) {
            $skippable[] = 'location';
        }

        // 5. Birth Date (Skippable)
        if ($customer->birth_date === null) {
            $skippable[] = 'birth_date';
        }

        return [
            'complete' => empty($missing),
            'missing' => $missing,
            'skippable' => $skippable,
        ];
    }
}
