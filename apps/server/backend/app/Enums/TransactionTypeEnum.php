<?php

namespace App\Enums;

enum TransactionTypeEnum: int
{
    case INCOME = 1;
    case EXPENSE = 2;
}
