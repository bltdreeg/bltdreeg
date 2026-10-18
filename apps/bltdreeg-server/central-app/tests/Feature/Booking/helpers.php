<?php

use Bltdreeg\Core\Modules\Customers\Models\Customer;
use Bltdreeg\Core\Modules\Queue\Models\BarberProfile;
use Bltdreeg\Core\Modules\Queue\Models\Chair;
use Bltdreeg\Core\Modules\Queue\Models\Slot;
use Bltdreeg\Core\Modules\Services\Models\Service;
use Bltdreeg\Core\Modules\Services\Models\ServiceCategory;
use Bltdreeg\Core\Modules\Tenancy\Models\Branch;
use Illuminate\Testing\TestResponse;

// تجهيزات مشتركة لاختبارات الحجز (مش ملف اختبار عشان Pest ميسجلش اختباراته مرتين)

/**
 * فرع مفتوح فيه كرسي عليه حلاق وخدمتين (قص 30 دقيقة/100، دقن 20 دقيقة/60).
 *
 * @return array{branch: Branch, chair: Chair, haircut: Service, beard: Service}
 */
function bookableChair(array $branchAttributes = []): array
{
    $branch = Branch::factory()->create(['is_open' => true, ...$branchAttributes]);
    $chair = Chair::factory()->create(['branch_id' => $branch->id]);
    BarberProfile::factory()->forChair($chair)->create(['name' => 'Karim']);
    $category = ServiceCategory::factory()->create(['tenant_id' => $branch->tenant_id]);
    $service = fn (string $en, int $duration, int $price) => Service::factory()->create([
        'tenant_id' => $branch->tenant_id,
        'category_id' => $category->id,
        'name' => ['ar' => $en, 'en' => $en],
        'duration' => $duration,
        'price' => $price,
    ]);

    return [
        'branch' => $branch,
        'chair' => $chair,
        'haircut' => $service('Haircut', 30, 100),
        'beard' => $service('Beard', 20, 60),
    ];
}

function joinNow(Customer $customer, Chair $chair, array $serviceIds): TestResponse
{
    return test()->actingAs($customer, 'customer')->postJson('/api/v1/reservations', [
        'type' => 'join_now',
        'chair_id' => $chair->id,
        'service_ids' => $serviceIds,
    ], ['Accept-Language' => 'en']);
}

function bookSlot(Customer $customer, Slot $slot, array $serviceIds): TestResponse
{
    return test()->actingAs($customer, 'customer')->postJson('/api/v1/reservations', [
        'type' => 'slot',
        'slot_id' => $slot->id,
        'service_ids' => $serviceIds,
    ], ['Accept-Language' => 'en']);
}
