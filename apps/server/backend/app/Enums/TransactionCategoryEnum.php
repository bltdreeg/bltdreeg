<?php

namespace App\Enums;

enum TransactionCategoryEnum: int
{
    case APPOINTMENT = 1;
    case PRODUCT_SALE = 2;
    case SALARY = 3;
    case RENT = 4;
    case UTILITIES = 5;
    case SUPPLIES = 6;
    case OTHER = 7;
}
