<?php

namespace App\Modules\V1\Customer\Auth\Support;

use App\Modules\V1\Customer\Auth\Models\CustomerSocialAccount;
use Bltdreeg\Core\Modules\Customers\Models\Customer;
use Illuminate\Support\Facades\DB;

class CustomerDeletion
{
    /**
     * Anonymize customer data, revoke tokens, and soft delete the account.
     */
    public static function delete(Customer $customer): void
    {
        DB::transaction(function () use ($customer) {
            // 1. Delete all personal access tokens and linked social accounts
            $customer->tokens()->delete();
            CustomerSocialAccount::query()->where('customer_id', $customer->id)->delete();

            // 2. Anonymize personal info and compute phone tombstone hash
            $appKey = (string) config('app.key');
            $tombstoneHash = $customer->phone !== null
                ? hash('sha256', $customer->phone.$appKey)
                : null;

            $customer->forceFill([
                'phone' => null,
                'phone_verified_at' => null,
                'email' => null,
                'email_verified_at' => null,
                'pending_email' => null,
                'first_name' => 'Deleted',
                'last_name' => 'customer',
                'password' => null,
                'birth_date' => null,
                'last_lat' => null,
                'last_lng' => null,
                'location_source' => null,
                'location_updated_at' => null,
                'phone_tombstone_hash' => $tombstoneHash,
            ])->save();

            // 3. Soft delete the customer record
            $customer->delete();
        });
    }
}
