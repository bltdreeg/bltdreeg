<?php

namespace Bltdreeg\Core\Modules\Queue\Enums;

enum QueueEventTypeEnum: string
{
    case Joined = 'join';
    case SlotBooked = 'slot_booked';
    case SlotJoined = 'slot_joined';
    case SlotConflictCancelled = 'slot_conflict_cancelled';
    case Cancelled = 'cancel';
    case ServiceStarted = 'service_started';
    case Served = 'served';
}
