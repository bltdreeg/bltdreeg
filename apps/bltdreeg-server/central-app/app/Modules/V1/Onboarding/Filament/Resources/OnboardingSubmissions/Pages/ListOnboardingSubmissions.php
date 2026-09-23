<?php

namespace App\Modules\V1\Onboarding\Filament\Resources\OnboardingSubmissions\Pages;

use App\Modules\V1\Onboarding\Filament\Resources\OnboardingSubmissions\OnboardingSubmissionResource;
use Filament\Resources\Pages\ListRecords;

class ListOnboardingSubmissions extends ListRecords
{
    protected static string $resource = OnboardingSubmissionResource::class;
}
