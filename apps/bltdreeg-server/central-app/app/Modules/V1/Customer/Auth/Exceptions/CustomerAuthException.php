<?php

namespace App\Modules\V1\Customer\Auth\Exceptions;

use Exception;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class CustomerAuthException extends Exception
{
    public function __construct(
        public readonly string $errorCode,
        public readonly int $statusCode = 422,
        public readonly array $data = [],
        ?string $message = null,
        ?\Throwable $previous = null,
    ) {
        $resolvedMessage = $message ?? __("customer_auth.errors.{$errorCode}");
        if ($resolvedMessage === "customer_auth.errors.{$errorCode}") {
            $resolvedMessage = $errorCode;
        }

        parent::__construct($resolvedMessage, $statusCode, $previous);
    }

    public function render(Request $request): JsonResponse
    {
        return response()->json([
            'message' => $this->getMessage(),
            'code' => $this->errorCode,
            'data' => (object) $this->data,
            'errors' => (object) [],
        ], $this->statusCode);
    }
}
