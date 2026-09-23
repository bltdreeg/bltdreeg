@php
    use Filament\Support\Icons\Heroicon;
    use Filament\Support\View\ComponentAttributeBag;
    use Filament\View\PanelsIconAlias;

    $currentLabel = $options[(string) $branchId] ?? ($options ? reset($options) : null);
    $canSwitch = count($options) > 1;
@endphp

@once
    <style>
        .fi-branch-switcher {
            display: inline-flex;
            align-items: center;
            max-width: 16rem;
        }

        .fi-branch-switcher .fi-dropdown-trigger {
            display: inline-flex;
        }

        .fi-branch-switcher-trigger.fi-tenant-menu-trigger {
            width: auto;
            max-width: 16rem;
            column-gap: 0.625rem;
            padding-inline: 0.625rem;
            padding-block: 0.375rem;
            background-color: color-mix(in oklab, var(--gray-950) 5%, transparent);
        }

        .fi-branch-switcher-trigger.fi-tenant-menu-trigger:hover,
        .fi-branch-switcher-trigger.fi-tenant-menu-trigger:focus-visible {
            background-color: color-mix(in oklab, var(--gray-950) 8%, transparent);
        }

        .fi-branch-switcher-trigger .fi-branch-switcher-icon {
            display: inline-flex;
            flex-shrink: 0;
            width: 1.75rem;
            height: 1.75rem;
            align-items: center;
            justify-content: center;
            border-radius: 0.5rem;
            background-color: color-mix(in oklab, var(--primary-500) 15%, transparent);
            color: var(--primary-600);
        }

        .fi-branch-switcher-trigger .fi-tenant-menu-trigger-text {
            min-width: 0;
            flex: 1 1 auto;
        }

        .fi-branch-switcher-trigger .fi-tenant-menu-trigger-tenant-name {
            overflow: hidden;
            text-overflow: ellipsis;
            white-space: nowrap;
            font-weight: 600;
        }

        .fi-branch-switcher-trigger:disabled {
            cursor: default;
            opacity: 1;
        }

        .dark .fi-branch-switcher-trigger.fi-tenant-menu-trigger {
            background-color: color-mix(in oklab, white 5%, transparent);
        }

        .dark .fi-branch-switcher-trigger.fi-tenant-menu-trigger:hover,
        .dark .fi-branch-switcher-trigger.fi-tenant-menu-trigger:focus-visible {
            background-color: color-mix(in oklab, white 10%, transparent);
        }

        .dark .fi-branch-switcher-trigger .fi-branch-switcher-icon {
            background-color: color-mix(in oklab, var(--primary-400) 15%, transparent);
            color: var(--primary-400);
        }
    </style>
@endonce

<div
    wire:key="branch-switcher-{{ implode('-', array_keys($options)) }}-{{ $branchId }}"
    @class([
        'fi-branch-switcher',
        'hidden' => count($options) === 0 || blank($currentLabel),
    ])
>
    <x-filament::dropdown
        placement="bottom-start"
        width="xs"
        :teleport="true"
    >
        <x-slot name="trigger">
            <button
                type="button"
                @disabled(! $canSwitch)
                class="fi-tenant-menu-trigger fi-branch-switcher-trigger"
            >
                <span class="fi-branch-switcher-icon" aria-hidden="true">
                    {{ \Filament\Support\generate_icon_html(Heroicon::OutlinedBuildingStorefront, attributes: (new ComponentAttributeBag)->class(['fi-icon fi-size-sm'])) }}
                </span>

                <span class="fi-tenant-menu-trigger-text">
                    <span class="fi-tenant-menu-trigger-current-tenant-label">
                        {{ __('core::branches.branch') }}
                    </span>
                    <span class="fi-tenant-menu-trigger-tenant-name">
                        {{ $currentLabel }}
                    </span>
                </span>

                @if ($canSwitch)
                    {{
                        \Filament\Support\generate_icon_html(
                            Heroicon::ChevronDown,
                            alias: PanelsIconAlias::TENANT_MENU_TOGGLE_BUTTON,
                        )
                    }}
                @endif
            </button>
        </x-slot>

        @if ($canSwitch)
            <x-filament::dropdown.header>
                {{ __('core::branches.switch_branch') }}
            </x-filament::dropdown.header>

            <x-filament::dropdown.list>
                @foreach ($options as $id => $label)
                    @php
                        $isActive = (string) $branchId === (string) $id;
                    @endphp

                    <x-filament::dropdown.list.item
                        wire:click="selectBranch('{{ $id }}')"
                        wire:loading.attr="disabled"
                        :icon="$isActive ? Heroicon::CheckCircle : Heroicon::OutlinedBuildingStorefront"
                        :color="$isActive ? 'primary' : 'gray'"
                    >
                        {{ $label }}
                    </x-filament::dropdown.list.item>
                @endforeach
            </x-filament::dropdown.list>
        @endif
    </x-filament::dropdown>
</div>
