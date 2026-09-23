<?php

namespace Bltdreeg\Core\Modules\Tenancy\Support;

use Bltdreeg\Core\Modules\Tenancy\Models\Branch;

class BranchContext
{
    public ?Branch $branch = null;

    public function set(?Branch $branch): void
    {
        $this->branch = $branch;
    }

    public function id(): int|string|null
    {
        return $this->branch?->getKey();
    }

    public function flush(): void
    {
        $this->branch = null;
    }
}