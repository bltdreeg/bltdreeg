// المفضلة الوهمية — منقولة من FakeFavoritesRemoteDataSource في Flutter: محتاجة تسجيل دخول، وبتبدأ بـ s1 و s3 و s5
import { MockHttpError, route, type MockRequest } from "./router.ts";

const ids = new Set(["s1", "s3", "s5"]);

const authed = (req: MockRequest) => {
  if (!req.token) throw new MockHttpError(401, "auth.unauthenticated", "Unauthenticated.");
};

export const favoriteRoutes = [
  route("GET", "/favorites", (req) => {
    authed(req);
    return [...ids];
  }),
  route("PUT", "/favorites/:salonId", (req) => {
    authed(req);
    ids.add(req.params.salonId);
    return null;
  }),
  route("DELETE", "/favorites/:salonId", (req) => {
    authed(req);
    ids.delete(req.params.salonId);
    return null;
  }),
];
