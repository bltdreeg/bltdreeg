<?php

namespace Bltdreeg\Core\Modules\Queue\Enums;

enum ChairStatusEnum: string
{
    case Active = 'active';
    case Off = 'off';
    case DisabledEmergency = 'disabled_emergency';
}
