import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";

const withNextIntl = createNextIntlPlugin("./src/i18n/request.ts");

// صور الفروع بتتخدم من نفس origin بتاع Laravel تحت /storage-shared (شوف CoreServiceProvider)
const apiOrigin = new URL(process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8011/api/v1");

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: apiOrigin.protocol.replace(":", "") as "http" | "https",
        hostname: apiOrigin.hostname,
        port: apiOrigin.port,
        pathname: "/storage-shared/**",
      },
    ],
    // Next 16 بيمنع تحسين الصور من IP محلي؛ Laravel على localhost في التطوير بس
    dangerouslyAllowLocalIP: process.env.NODE_ENV !== "production",
  },
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
