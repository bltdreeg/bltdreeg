<?php

namespace App\Modules\V1\Onboarding\Filament\Resources\OnboardingSubmissions\Tables;

use Bltdreeg\Core\Modules\Onboarding\Enums\SubmissionStatusEnum;
use Filament\Actions\ViewAction;
use Filament\Tables\Columns\TextColumn;
use Filament\Tables\Filters\SelectFilter;
use Filament\Tables\Table;

class OnboardingSubmissionsTable
{
    public static function configure(Table $table): Table
    {
        return $table
            ->modifyQueryUsing(fn ($query) => $query->with('tenant'))
            ->defaultSort('created_at', 'desc')
            ->columns([
                TextColumn::make('tenant.name')
                    ->label(__('core::onboarding.admin.salon'))
                    ->searchable(),
                TextColumn::make('tenant.slug')
                    ->label('Slug')
                    ->searchable(),
                TextColumn::make('revision')
                    ->label(__('core::onboarding.admin.revision'))
                    ->prefix('#')
                    ->sortable(),
                TextColumn::make('status')
                    ->label(__('core::onboarding.admin.status'))
                    ->badge()
                    ->formatStateUsing(fn (SubmissionStatusEnum $state): string => $state->label())
                    ->color(fn (SubmissionStatusEnum $state): string => $state->color()),
                TextColumn::make('created_at')
                    ->label(__('core::onboarding.admin.submitted_at'))
                    ->dateTime()
                    ->sortable(),
            ])
            ->filters([
                SelectFilter::make('status')
                    ->label(__('core::onboarding.admin.status'))
                    ->options(collect(SubmissionStatusEnum::cases())
                        ->mapWithKeys(fn (SubmissionStatusEnum $status): array => [$status->value => $status->label()])
                        ->all())
                    ->default(SubmissionStatusEnum::PENDING->value),
            ])
            ->recordActions([
                ViewAction::make(),
            ]);
    }
}
