<?php

namespace App\Modules\V1\Customer\Auth\Http\Controllers;

use App\Modules\V1\Customer\Auth\Models\OtpChannelSetting;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Routing\Controller;

class AuthOptionsController extends Controller
{
    public function __invoke(Request $request): JsonResponse
    {
        $otpChannels = OtpChannelSetting::getCached()
            ->where('is_enabled', true)
            ->whereIn('channel', ['whatsapp', 'sms'])
            ->sortBy('sort')
            ->pluck('channel')
            ->values()
            ->all();

        $socialProviders = [];
        if (! empty(config('customer_auth.social.google.client_ids'))) {
            $socialProviders[] = 'google';
        }
        if (config('customer_auth.social.apple.enabled') && ! empty(config('customer_auth.social.apple.client_ids'))) {
            $socialProviders[] = 'apple';
        }

        return response()->json([
            'otp_channels' => $otpChannels,
            'social_providers' => $socialProviders,
            'terms_version' => config('customer_auth.terms_version'),
        ]);
    }
}
