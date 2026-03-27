// app/robots.ts

import { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: [
          "/dashboard",
          "/api",
          "/auth",
          "/login",
          "/register",
          "/onboarding",
        ],
      },
    ],
    sitemap: "https://prepwise-app-mu.vercel.app/sitemap.xml",
  };
}
