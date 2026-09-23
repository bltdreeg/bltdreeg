<?php

namespace App\Modules\V1\Branches\Livewire;

use Bltdreeg\Core\Modules\Tenancy\Models\Branch;
use Bltdreeg\Core\Modules\Auth\Models\User;
use Bltdreeg\Core\Modules\Tenancy\Support\BranchSelection;
use Filament\Facades\Filament;
use Illuminate\Contracts\View\View;
use Livewire\Component;

class BranchSwitcher extends Component
{
    public mixed $branchId = null;

    /** @var array<int|string, string> */
    public array $options = [];

    public function mount(): void
    {
        $this->refreshOptions();
    }

    public function selectBranch(mixed $value = null): void
    {
        $value ??= $this->branchId;

        /** @var User|null $user */
        $user = Filament::auth()->user();
        $tenant = Filament::getTenant();

        if (! $user || ! $tenant || blank($value)) {
            return;
        }

        $branch = app(BranchSelection::class)
            ->allowedFor($user, $tenant)
            ->first(fn (Branch $branch): bool => (string) $branch->getKey() === (string) $value);

        if (! $branch) {
            $this->refreshOptions();

            return;
        }

        if ((string) app(BranchSelection::class)->id() === (string) $branch->getKey()) {
            return;
        }

        app(BranchSelection::class)->set($branch);

        // Full reload so tenant middleware / BranchContext rebind to the new branch.
        $this->redirect(Filament::getUrl($tenant), navigate: false);
    }

    public function updatedBranchId(mixed $value): void
    {
        $this->selectBranch($value);
    }

    public function render(): View
    {
        return view('livewire.branch-switcher');
    }

    protected function refreshOptions(): void
    {
        /** @var User|null $user */
        $user = Filament::auth()->user();
        $tenant = Filament::getTenant();

        if (! $user || ! $tenant) {
            $this->options = [];
            $this->branchId = null;

            return;
        }

        $selection = app(BranchSelection::class);
        $allowed = $selection->allowedFor($user, $tenant);

        $this->options = $allowed
            ->mapWithKeys(fn (Branch $branch): array => [
                (string) $branch->getKey() => $branch->name,
            ])
            ->all();

        $this->branchId = $selection->resolve($user, $tenant)?->getKey();
    }
}
