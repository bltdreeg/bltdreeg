<?php

namespace App\Filament\Pages\Tenancy;

use App\Enums\CurrencyEnum;
use App\Models\Shop;
use Filament\Forms\Components\Select;
use Filament\Forms\Components\Textarea;
use Filament\Forms\Components\TextInput;
use Filament\Forms\Components\Toggle;
use Filament\Pages\Tenancy\RegisterTenant;
use Filament\Schemas\Schema;
use Illuminate\Database\Eloquent\Model;

class RegisterShop extends RegisterTenant
{
    public static function getLabel(): string
    {
        return 'Register shop';
    }

    public static function canView(): bool
    {
        return auth()->user()?->is_super_admin ?? false;
    }

    public function form(Schema $schema): Schema
    {
        return $schema
            ->components([
                TextInput::make('name')
                    ->required()
                    ->maxLength(255),
                TextInput::make('slug')
                    ->required()
                    ->maxLength(255)
                    ->unique('shops', 'slug'),
                TextInput::make('email')
                    ->email()
                    ->required()
                    ->maxLength(255)
                    ->unique('shops', 'email'),
                TextInput::make('phone')
                    ->tel()
                    ->required()
                    ->maxLength(255),
                Textarea::make('address')
                    ->required(),
                Select::make('currency')
                    ->options(CurrencyEnum::class)
                    ->required(),
                Toggle::make('is_active')
                    ->default(true),
            ]);
    }

    protected function handleRegistration(array $data): Model
    {
        $shop = Shop::create($data);

        $shop->users()->attach(auth()->user());

        return $shop;
    }
}
