<?php

namespace Bltdreeg\Core\Modules\Queue\Support;

use Bltdreeg\Core\Modules\Queue\Enums\ChairStatusEnum;
use Bltdreeg\Core\Modules\Queue\Models\BarberProfile;
use Bltdreeg\Core\Modules\Queue\Models\Chair;
use Bltdreeg\Core\Modules\Queue\Models\Slot;
use Bltdreeg\Core\Modules\Tenancy\Models\Branch;
use Bltdreeg\Core\Modules\Tenancy\Models\Tenant;
use Carbon\CarbonImmutable;

/**
 * بيانات تجريبية للحجز: كل فرع مفتوح، فيه كرسيين عليهم حلاقين، و slots كل ساعة لأسبوع قدام.
 * آمنة تتنادى أكتر من مرة (زي DemoData) — اللي موجود مبيتكررش.
 */
class DemoQueue
{
    public const CHAIRS_PER_BRANCH = 2;

    public const SLOT_DAYS = 7;

    /** من 10 الصبح لحد 9 بالليل بتوقيت مصر */
    public const SLOT_HOURS = [10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21];

    private const BARBER_NAMES = ['كريم مصطفى', 'محمود عبد العال', 'أحمد سمير', 'حسن علي', 'عمر خالد', 'يوسف إبراهيم'];

    public static function seed(Tenant $tenant): void
    {
        $branches = Branch::query()->withoutGlobalScopes()->where('tenant_id', $tenant->id)->orderBy('id')->get();
        $names = self::BARBER_NAMES;

        foreach ($branches as $branchIndex => $branch) {
            if (! $branch->is_open) {
                $branch->forceFill(['is_open' => true, 'opened_at' => now()])->save();
            }

            for ($position = 1; $position <= self::CHAIRS_PER_BRANCH; $position++) {
                $chair = Chair::query()->firstOrCreate(
                    ['branch_id' => $branch->id, 'position_no' => $position],
                    ['status' => ChairStatusEnum::Active],
                );

                BarberProfile::query()->withoutGlobalScopes()->firstOrCreate(
                    ['tenant_id' => $tenant->id, 'default_chair_id' => $chair->id],
                    ['name' => $names[($branchIndex * self::CHAIRS_PER_BRANCH + $position - 1) % count($names)], 'is_active' => true],
                );

                self::seedSlots($chair);
            }
        }
    }

    private static function seedSlots(Chair $chair): void
    {
        $today = CarbonImmutable::now(Slot::TIMEZONE)->startOfDay();

        for ($day = 0; $day < self::SLOT_DAYS; $day++) {
            $date = $today->addDays($day)->toDateString();

            foreach (self::SLOT_HOURS as $hour) {
                $startAt = sprintf('%02d:00:00', $hour);
                // whereDate مش firstOrCreate: الـ date cast بيخزن "Y-m-d 00:00:00" في SQLite فالمقارنة بالنص بتفشل
                $exists = Slot::query()
                    ->where('chair_id', $chair->id)
                    ->whereDate('day', $date)
                    ->where('start_at', $startAt)
                    ->exists();

                if (! $exists) {
                    Slot::query()->create(['chair_id' => $chair->id, 'day' => $date, 'start_at' => $startAt, 'capacity' => 1]);
                }
            }
        }
    }
}
