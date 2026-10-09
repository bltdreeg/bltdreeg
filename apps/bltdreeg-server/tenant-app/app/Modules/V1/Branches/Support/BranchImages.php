<?php

declare(strict_types=1);

namespace App\Modules\V1\Branches\Support;

use Bltdreeg\Core\Modules\Tenancy\Models\Branch;
use Filament\Forms\Components\FileUpload;
use Filament\Forms\Components\Radio;
use Filament\Schemas\Components\Utilities\Get;
use Filament\Schemas\Components\Utilities\Set;

/**
 * Branch photos shared by the onboarding wizard and the branch form: an ordered upload plus the one picked as cover.
 * The cover is picked by position (`cover_index`) and turned into a stored path by {@see self::resolve()}.
 */
class BranchImages
{
    public const MAX_FILES = 10;

    /**
     * @return list<FileUpload|Radio>
     */
    public static function fields(): array
    {
        return [
            FileUpload::make('images')
                ->label(__('core::branches.images'))
                ->helperText(__('core::branches.images_helper'))
                ->image()
                ->multiple()
                ->reorderable()
                ->appendFiles()
                ->disk(Branch::IMAGES_DISK)
                ->directory('branches')
                ->visibility('public')
                ->maxFiles(self::MAX_FILES)
                ->maxSize(4096)
                ->live()
                ->afterStateUpdated(function (Get $get, Set $set): void {
                    $count = count((array) $get('images'));
                    $cover = $get('cover_index');

                    if ($count > 0 && (! is_numeric($cover) || (int) $cover >= $count)) {
                        $set('cover_index', 0);
                    }
                }),
            Radio::make('cover_index')
                ->label(__('core::branches.cover_image'))
                ->helperText(__('core::branches.cover_image_helper'))
                ->options(fn (Get $get): array => collect(range(1, max(count((array) $get('images')), 1)))
                    ->mapWithKeys(fn (int $position): array => [$position - 1 => __('core::branches.image_number', ['number' => $position])])
                    ->all())
                ->inline()
                ->visible(fn (Get $get): bool => filled($get('images')))
                ->required(fn (Get $get): bool => filled($get('images')))
                ->afterStateHydrated(function (Radio $component, ?Branch $record): void {
                    if ($record === null || $record->cover_image === null) {
                        return;
                    }

                    $position = array_search($record->cover_image, array_values($record->images ?? []), true);

                    $component->state($position === false ? 0 : $position);
                }),
        ];
    }

    /**
     * Turns the form answers into branch columns. `cover_index` is not a column, so it is always removed.
     *
     * @param  array<string, mixed>  $data
     * @return array<string, mixed>
     */
    public static function resolve(array $data): array
    {
        $coverIndex = $data['cover_index'] ?? null;
        unset($data['cover_index']);

        if (! array_key_exists('images', $data)) {
            return $data;
        }

        $images = array_values(array_filter((array) $data['images'], 'is_string'));

        $data['images'] = $images === [] ? null : $images;
        $data['cover_image'] = $images[is_numeric($coverIndex) ? (int) $coverIndex : 0] ?? $images[0] ?? null;

        return $data;
    }
}
