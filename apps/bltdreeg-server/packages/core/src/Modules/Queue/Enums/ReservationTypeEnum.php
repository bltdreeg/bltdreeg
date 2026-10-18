<?php

namespace Bltdreeg\Core\Modules\Queue\Enums;

enum ReservationTypeEnum: string
{
    /** دخل الطابور على طول — join_time = لحظة الحجز */
    case JoinNow = 'join_now';

    /** حجز ميعاد دخول على كرسي — بيدخل الطابور لما الميعاد ييجي (join_time = بداية الـ slot) */
    case Slot = 'slot';
}
