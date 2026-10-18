<?php

namespace Bltdreeg\Core\Modules\Queue\Exceptions;

use Exception;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

/**
 * رفض من محرك الطابور بكود ثابت (booking.*) — نفس شكل أخطاء الـ customer API:
 * {message, code, data, errors}. الرسالة من core::queue.errors.{code}.
 */
class QueueException extends Exception
{
    /**
     * @param  array<string, mixed>  $data
     */
    public function __construct(
        public readonly string $errorCode,
        public readonly int $statusCode = 422,
        public readonly array $data = [],
    ) {
        $key = 'core::queue.errors.'.str_replace('booking.', '', $errorCode);
        $message = __($key, array_filter($data, 'is_scalar'));

        parent::__construct($message === $key ? $errorCode : $message, $statusCode);
    }

    /** رفض قاعدة بيزنس (409/422) مش عطل — ميتسجلش في اللوج */
    public function report(): void {}

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
