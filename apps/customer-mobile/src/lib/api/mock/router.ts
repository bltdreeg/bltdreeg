// جدول مسارات الـ mock API: "GET /salons/:id" → handler. منفصل عن axios عشان يتختبر بـ node.

export type HttpMethod = "GET" | "POST" | "PUT" | "PATCH" | "DELETE";

export interface MockRequest {
  params: Record<string, string>;
  query: Record<string, string>;
  body: Record<string, unknown>;
  locale: "ar" | "en";
  /** Bearer token لو موجود */
  token: string | null;
}

export type MockHandler = (req: MockRequest) => unknown;

export interface MockRoute {
  method: HttpMethod;
  segments: string[];
  handler: MockHandler;
}

/** استجابة غلط بنفس envelope بتاع Laravel: { message, code, data, errors } */
export class MockHttpError extends Error {
  readonly status: number;
  readonly body: { message: string; code: string; data?: Record<string, unknown>; errors?: Record<string, string[]> };

  constructor(status: number, code: string, message: string, data?: Record<string, unknown>, errors?: Record<string, string[]>) {
    super(message);
    this.status = status;
    this.body = { message, code, data, errors };
  }
}

const split = (path: string) => path.split("?")[0].split("/").filter(Boolean);

export function route(method: HttpMethod, pattern: string, handler: MockHandler): MockRoute {
  return { method, segments: split(pattern), handler };
}

export function matchRoute(
  routes: MockRoute[],
  method: string,
  path: string,
): { handler: MockHandler; params: Record<string, string> } | null {
  const parts = split(path);
  for (const r of routes) {
    if (r.method !== method.toUpperCase() || r.segments.length !== parts.length) continue;
    const params: Record<string, string> = {};
    const ok = r.segments.every((seg, i) => {
      if (seg.startsWith(":")) {
        params[seg.slice(1)] = decodeURIComponent(parts[i]);
        return true;
      }
      return seg === parts[i];
    });
    if (ok) return { handler: r.handler, params };
  }
  return null;
}
