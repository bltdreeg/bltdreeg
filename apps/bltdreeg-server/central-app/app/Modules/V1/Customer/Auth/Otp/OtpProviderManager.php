<?php

namespace App\Modules\V1\Customer\Auth\Otp;

use App\Modules\V1\Customer\Auth\Otp\Contracts\OtpProvider;
use App\Modules\V1\Customer\Auth\Otp\Providers\FakeOtpProvider;
use App\Modules\V1\Customer\Auth\Otp\Providers\LogOtpProvider;
use App\Modules\V1\Customer\Auth\Otp\Providers\MailOtpProvider;
use Illuminate\Support\Manager;

class OtpProviderManager extends Manager
{
    public function getDefaultDriver(): string
    {
        return $this->config->get('customer_auth.otp.default_provider', 'log');
    }

    public function createLogDriver(): OtpProvider
    {
        return new LogOtpProvider;
    }

    public function createFakeDriver(): OtpProvider
    {
        return $this->container->make(FakeOtpProvider::class);
    }

    public function createMailDriver(): OtpProvider
    {
        return new MailOtpProvider;
    }
}
