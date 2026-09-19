<?php

namespace App\Filament\Auth\Pages;

use Bltdreeg\Core\Models\Branch;
use Bltdreeg\Core\Models\Tenant;
use Bltdreeg\Core\Models\User;
use Filament\Auth\Http\Responses\Contracts\LoginResponse;
use Filament\Auth\Pages\Login as BaseLogin;
use Filament\Facades\Filament;
use Filament\Forms\Components\Select;
use Filament\Schemas\Components\Component;
use Filament\Schemas\Schema;
use Illuminate\Http\RedirectResponse;
use Illuminate\Routing\Redirector;
use Illuminate\Support\Facades\Route;
use Illuminate\Validation\ValidationException;

class Login extends BaseLogin
{
    public function form(Schema $schema): Schema
    {
        return $schema
            ->components([
                $this->getEmailFormComponent(),
                $this->getPasswordFormComponent(),
                $this->getBranchFormComponent(),
                $this->getRememberFormComponent(),
            ]);
    }

    protected function getBranchFormComponent(): Component
    {
        return Select::make('branch_id')
            ->label(__('core::branches.branch'))
            ->placeholder(__('core::branches.select_branch'))
            ->options(function (): array {
                $user = $this->branchUser();

                if ($user?->is_super_admin) {
                    return [];
                }

                $query = Branch::query()->with(['tenant:id,name']);

                if ($user?->branch_id) {
                    $query->whereKey($user->branch_id);
                } elseif ($user) {
                    $query->where('is_active', true)
                        ->whereIn('tenant_id', $user->tenants()->pluck('tenants.id'));
                }

                return $query->get()
                    ->mapWithKeys(fn (Branch $branch): array => [
                        $branch->getKey() => $branch->tenant->name.' — '.$branch->name,
                    ])
                    ->all();
            })
            ->default(fn (): mixed => $this->branchUser()?->branch_id)
            ->required(fn (): bool => ! $this->branchUser()?->is_super_admin)
            ->hidden(fn (): bool => (bool) $this->branchUser()?->is_super_admin)
            ->searchable();
    }

    public function authenticate(): ?LoginResponse
    {
        $data = $this->form->getState();

        $candidate = $this->branchUser();

        if ($candidate && ! $candidate->is_super_admin) {
            $this->validateBranchSelection($candidate, $data['branch_id'] ?? null);
        }

        $response = parent::authenticate();

        if ($response === null) {
            return null;
        }

        /** @var User $user */
        $user = Filament::auth()->user();

        $tenant = $user->branch_id
            ? $user->branch?->tenant
            : Branch::query()->find($data['branch_id'] ?? null)?->tenant;

        return new class($tenant) implements LoginResponse
        {
            public function __construct(private ?Tenant $tenant) {}

            public function toResponse($request): RedirectResponse|Redirector
            {
                if ($this->tenant) {
                    $url = Route::has('filament.app.home')
                        ? route('filament.app.home', ['tenant' => $this->tenant->slug])
                        : url('/'.$this->tenant->slug);

                    return redirect()->to($url);
                }

                return redirect()->intended(Filament::getUrl());
            }
        };
    }

    protected function validateBranchSelection(User $user, mixed $branchId): void
    {
        if ($user->branch_id) {
            if (blank($branchId) || (int) $branchId !== (int) $user->branch_id) {
                throw ValidationException::withMessages([
                    'data.branch_id' => __('core::branches.invalid_branch'),
                ]);
            }

            return;
        }

        $branch = $branchId !== null && $branchId !== ''
            ? Branch::query()->find($branchId)
            : null;

        if (! $branch || ! $branch->is_active || ! $user->canAccessTenant($branch->tenant)) {
            throw ValidationException::withMessages([
                'data.branch_id' => __('core::branches.invalid_branch'),
            ]);
        }
    }

    protected function branchUser(): ?User
    {
        $email = $this->data['email'] ?? null;

        if (blank($email)) {
            return null;
        }

        return User::query()->where('email', $email)->first();
    }
}
