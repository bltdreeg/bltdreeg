<?php

declare(strict_types=1);

namespace App\Modules\V1\CustomerAuth\Exceptions;

use Exception;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class CustomerAuthException extends Exception
{
    /**
     * @param  array<string, mixed>  $data
     */
    public function __construct(
        public readonly string $errorCode,
        public readonly int $status = 422,
        public readonly array $data = [],
        ?string $message = null,
    ) {
        parent::__construct($message ?? (string) __("customer_auth.{$errorCode}"));
    }

    /**
     * @param  array<string, mixed>  $data
     */
    public static function make(string $code, int $status = 422, array $data = [], ?string $message = null): self
    {
        return new self($code, $status, $data, $message);
    }

    public function render(Request $request): ?JsonResponse
    {
        if (! $request->is('api/*') && ! $request->expectsJson()) {
            return null;
        }

        return response()->json([
            'message' => $this->getMessage(),
            'code' => $this->errorCode,
            'data' => empty($this->data) ? (object) [] : $this->data,
            'errors' => (object) [],
        ], $this->status);
    }
}
