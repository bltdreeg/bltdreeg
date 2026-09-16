<?php

namespace App\Enums;

enum AppointmentStatusEnum: int
{
    case PENDING = 1;
    case CONFIRMED = 2;
    case IN_PROGRESS = 3;
    case COMPLETED = 4;
    case CANCELLED = 5;
    case NO_SHOW = 6;
}
