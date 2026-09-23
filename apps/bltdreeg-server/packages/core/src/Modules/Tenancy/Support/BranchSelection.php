<?php

namespace Bltdreeg\Core\Modules\Tenancy\Support;

use Bltdreeg\Core\Modules\Tenancy\Models\Branch;
use Bltdreeg\Core\Modules\Tenancy\Models\Tenant;
use Bltdreeg\Core\Modules\Auth\Models\User;
use Illuminate\Support\Collection;

class BranchSelection
{
    public const SESSION_KEY = 'bltdreeg.selected_branch_id';

    /**
     * @return Collection<int, Branch>
     */
    public function allowedFor(User $user, Tenant $tenant): Collection
    {
        $query = Branch::query()
            ->withoutGlobalScope('branch')
            ->where('tenant_id', $tenant->getKey())
            ->where('is_active', true)
            ->orderBy('id');

        if ($user->branch_id) {
            $query->whereKey($user->branch_id);
        }

        return $query->get();
    }

    public function id(): int|string|null
    {
        return session(self::SESSION_KEY);
    }

    public function set(Branch $branch): void
    {
        session([self::SESSION_KEY => $branch->getKey()]);
    }

    public function clear(): void
    {
        session()->forget(self::SESSION_KEY);
    }

    public function resolve(User $user, Tenant $tenant): ?Branch
    {
        $allowed = $this->allowedFor($user, $tenant);
        $selectedId = $this->id();

        if ($selectedId === null) {
            return null;
        }

        $branch = $allowed->first(
            fn (Branch $branch): bool => (string) $branch->getKey() === (string) $selectedId
        );

        if (! $branch) {
            $this->clear();

            return null;
        }

        return $branch;
    }

    public function autoSelectIfOnlyOne(User $user, Tenant $tenant): ?Branch
    {
        if ($resolved = $this->resolve($user, $tenant)) {
            return $resolved;
        }

        $allowed = $this->allowedFor($user, $tenant);

        if ($allowed->count() !== 1) {
            return null;
        }

        /** @var Branch $branch */
        $branch = $allowed->first();
        $this->set($branch);

        return $branch;
    }
}
