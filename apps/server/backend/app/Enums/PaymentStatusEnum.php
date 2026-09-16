<?php

namespace App\Enums;

enum PaymentStatusEnum: int
{
    case PAID = 1;
    case UNPAID = 2;
}
