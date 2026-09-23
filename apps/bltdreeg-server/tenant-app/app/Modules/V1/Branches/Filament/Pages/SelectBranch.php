<?php

namespace App\Modules\V1\Branches\Filament\Pages;

use Bltdreeg\Core\Modules\Tenancy\Models\Branch;
use Bltdreeg\Core\Modules\Auth\Models\User;
use Bltdreeg\Core\Modules\Tenancy\Support\BranchSelection;
use Filament\Actions\Action;
use Filament\Facades\Filament;
use Filament\Forms\Components\Select;
use Filament\Notifications\Notification;
use Filament\Pages\Page;
use Filament\Schemas\Components\Actions;
use Filament\Schemas\Components\EmbeddedSchema;
use Filament\Schemas\Components\Form;
use Filament\Schemas\Schema;
use Filament\Support\Enums\Alignment;
use Illuminate\Contracts\Support\Htmlable;
use Illuminate\Validation\ValidationException;

/**
 * @property-read Schema $form
 */
class SelectBranch extends Page
{
    /**
     * @var array<string, mixed> | null
     */
    public ?array $data = [];

    protected static string $layout = 'filament-panels::components.layout.simple';

    protected static ?string $slug = 'select-branch';

    protected static bool $shouldRegisterNavigation = false;

    public function mount(): void
    {
        abort_unless(Filament::auth()->check() && Filament::getTenant(), 404);

        /** @var User $user */
        $user = Filament::auth()->user();
        $tenant = Filament::getTenant();
        $selection = app(BranchSelection::class);

        if ($selection->autoSelectIfOnlyOne($user, $tenant)) {
            $this->redirect(Filament::getUrl($tenant));

            return;
        }

        if ($selection->allowedFor($user, $tenant)->isEmpty()) {
            $this->redirect(Filament::getUrl($tenant));

            return;
        }

        $this->form->fill([
            'branch_id' => $selection->id(),
        ]);
    }

    public function defaultForm(Schema $schema): Schema
    {
        return $schema->statePath('data');
    }

    public function form(Schema $schema): Schema
    {
        return $schema
            ->components([
                Select::make('branch_id')
                    ->label(__('core::branches.branch'))
                    ->placeholder(__('core::branches.select_branch'))
                    ->options(fn (): array => $this->branchOptions())
                    ->required()
                    ->searchable(),
            ]);
    }

    public function content(Schema $schema): Schema
    {
        return $schema
            ->components([
                Form::make([EmbeddedSchema::make('form')])
                    ->id('form')
                    ->livewireSubmitHandler('select')
                    ->footer([
                        Actions::make([
                            Action::make('select')
                                ->label(__('core::branches.continue'))
                                ->submit('select'),
                        ])
                            ->alignment(Alignment::Start)
                            ->fullWidth(true)
                            ->key('form-actions'),
                    ]),
            ]);
    }

    public function select(): void
    {
        /** @var User $user */
        $user = Filament::auth()->user();
        $tenant = Filament::getTenant();
        abort_unless($user && $tenant, 404);

        $data = $this->form->getState();
        $branchId = $data['branch_id'] ?? null;

        $branch = app(BranchSelection::class)
            ->allowedFor($user, $tenant)
            ->first(fn (Branch $branch): bool => (string) $branch->getKey() === (string) $branchId);

        if (! $branch) {
            throw ValidationException::withMessages([
                'data.branch_id' => __('core::branches.invalid_branch'),
            ]);
        }

        app(BranchSelection::class)->set($branch);

        Notification::make()
            ->title(__('core::branches.branch_selected'))
            ->success()
            ->send();

        $this->redirect(Filament::getUrl($tenant));
    }

    public function getTitle(): string|Htmlable
    {
        return __('core::branches.select_branch');
    }

    public function getHeading(): string|Htmlable
    {
        return __('core::branches.select_branch');
    }

    /**
     * @return array<int|string, string>
     */
    protected function branchOptions(): array
    {
        /** @var User|null $user */
        $user = Filament::auth()->user();
        $tenant = Filament::getTenant();

        if (! $user || ! $tenant) {
            return [];
        }

        return app(BranchSelection::class)
            ->allowedFor($user, $tenant)
            ->mapWithKeys(fn (Branch $branch): array => [
                $branch->getKey() => $branch->name,
            ])
            ->all();
    }
}
