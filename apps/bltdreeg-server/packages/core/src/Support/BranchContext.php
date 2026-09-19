<?php

namespace Bltdreeg\Core\Support;

use Bltdreeg\Core\Models\Branch;

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