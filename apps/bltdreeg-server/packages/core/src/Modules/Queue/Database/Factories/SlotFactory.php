<?php

namespace Bltdreeg\Core\Modules\Queue\Database\Factories;

use Bltdreeg\Core\Modules\Queue\Models\Chair;
use Bltdreeg\Core\Modules\Queue\Models\Slot;
use Carbon\CarbonImmutable;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Slot>
 */
class SlotFactory extends Factory
{
    protected $model = Slot::class;

    public function definition(): array
    {
        return [
            'chair_id' => Chair::factory(),
            'day' => CarbonImmutable::now(Slot::TIMEZONE)->addDay()->toDateString(),
            'start_at' => '18:30:00',
            'capacity' => 1,
        ];
    }

    /** slot بيبدأ في لحظة معيّنة (بتتحول لوقت مصر المحلي) */
    public function startingAt(CarbonImmutable $moment): static
    {
        $local = $moment->setTimezone(Slot::TIMEZONE);

        return $this->state(fn () => [
            'day' => $local->toDateString(),
            'start_at' => $local->format('H:i:s'),
        ]);
    }
}
