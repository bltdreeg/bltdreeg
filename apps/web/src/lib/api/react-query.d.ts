// كل error في React Query هو ApiError (axios interceptor بيحوّل أي فشل ليه)
import type { ApiError } from "@/lib/utils/api/api-error";

declare module "@tanstack/react-query" {
  interface Register {
    defaultError: ApiError;
  }
}
