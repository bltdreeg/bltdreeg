// axios adapter بيرد من الـ mock بدل Laravel (EXPO_PUBLIC_API_MOCK=0 يرجّع السيرفر الحقيقي).
// نفس سلوك الشبكة: تأخير عشوائي، فشل شبكة لما النت مقطوع، و envelope أخطاء Laravel — فالـ interceptor والـ hooks مش بيفرّقوا.
import { AxiosError, AxiosHeaders, type AxiosAdapter, type AxiosResponse } from "axios";
import { connectivity } from "@/lib/utils/connectivity";
import { authRoutes } from "./auth.mock";
import { matchRoute, MockHttpError, type MockRoute } from "./router";
import { bookingRoutes } from "./bookings.mock";
import { favoriteRoutes } from "./favorites.mock";
import { notificationRoutes } from "./notifications.mock";
import { salonDetailsRoutes } from "./salon-details.mock";
import { salonRoutes } from "./salons.mock";

const routes: MockRoute[] = [...authRoutes, ...salonRoutes, ...salonDetailsRoutes, ...favoriteRoutes, ...bookingRoutes, ...notificationRoutes];

const LATENCY_MS = [300, 700] as const;
const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

function parseBody(data: unknown): Record<string, unknown> {
  if (typeof data === "string" && data) return JSON.parse(data) as Record<string, unknown>;
  return data && typeof data === "object" ? (data as Record<string, unknown>) : {};
}

export const mockAdapter: AxiosAdapter = async (config) => {
  await sleep(LATENCY_MS[0] + Math.random() * (LATENCY_MS[1] - LATENCY_MS[0]));

  if (!connectivity.isOnline()) {
    throw new AxiosError("Network Error", AxiosError.ERR_NETWORK, config);
  }

  const [pathname, qs = ""] = (config.url ?? "/").split("?");
  const query: Record<string, string> = Object.fromEntries(
    qs.split("&").filter(Boolean).map((kv) => kv.split("=").map((x) => decodeURIComponent(x.replace(/\+/g, " "))) as [string, string]),
  );
  for (const [k, v] of Object.entries((config.params ?? {}) as Record<string, unknown>)) {
    if (v !== undefined && v !== null) query[k] = Array.isArray(v) ? v.join(",") : String(v);
  }
  const headers = AxiosHeaders.from(config.headers);
  const match = matchRoute(routes, config.method ?? "get", pathname);

  const respond = (status: number, data: unknown): AxiosResponse => ({
    status,
    statusText: String(status),
    data,
    headers: {},
    config,
    request: {},
  });

  let response: AxiosResponse;
  try {
    if (!match) throw new MockHttpError(404, "http.not_found", `Not mocked: ${config.method?.toUpperCase()} ${pathname}`);
    const data = match.handler({
      params: match.params,
      query,
      body: parseBody(config.data),
      locale: headers.get("Accept-Language") === "en" ? "en" : "ar",
      token: String(headers.get("Authorization") ?? "").replace(/^Bearer /, "") || null,
    });
    response = respond(200, data);
  } catch (e) {
    if (!(e instanceof MockHttpError)) throw e;
    response = respond(e.status, e.body);
  }

  if (response.status >= 400) {
    throw new AxiosError(`Request failed with status code ${response.status}`, AxiosError.ERR_BAD_REQUEST, config, {}, response);
  }
  return response;
};
