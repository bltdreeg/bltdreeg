// خطأ API موحّد — بيترجم envelope الأخطاء بتاع Laravel: { message, code, data, errors }
export class ApiError extends Error {
  readonly status: number;
  readonly code: string;
  readonly data: Record<string, unknown>;
  readonly errors: Record<string, string[]>;

  constructor(
    status: number,
    code: string,
    message: string,
    data: Record<string, unknown> = {},
    errors: Record<string, string[]> = {},
  ) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.code = code;
    this.data = data;
    this.errors = errors;
  }
}

/** بيحوّل جسم استجابة غير ناجحة لـ ApiError، حتى لو الجسم مش JSON بالشكل المتوقع. */
export function toApiError(status: number, body: unknown): ApiError {
  const b = (body && typeof body === "object" ? body : {}) as Record<string, unknown>;
  const code = typeof b.code === "string" ? b.code : status === 401 ? "auth.unauthenticated" : "http.error";
  const message = typeof b.message === "string" ? b.message : `HTTP ${status}`;
  const data = b.data && typeof b.data === "object" && !Array.isArray(b.data) ? (b.data as Record<string, unknown>) : {};
  const errors =
    b.errors && typeof b.errors === "object" && !Array.isArray(b.errors) ? (b.errors as Record<string, string[]>) : {};
  return new ApiError(status, code, message, data, errors);
}
