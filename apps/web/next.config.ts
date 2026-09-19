import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";

const withNextIntl = createNextIntlPlugin("./src/i18n/request.ts");

const nextConfig: NextConfig = {
  async rewrites() {
    return [
      {
        source: "/:locale/booking/:id/rate",
        destination: "/:locale/bookings/:id/rate",
      },
      {
        source: "/:locale/booking/:id/rate/sent",
        destination: "/:locale/bookings/:id/rate/sent",
      },
      {
        source: "/booking/:id/rate",
        destination: "/bookings/:id/rate",
      },
      {
        source: "/booking/:id/rate/sent",
        destination: "/bookings/:id/rate/sent",
      },
    ];
  },
};

export default withNextIntl(nextConfig);
