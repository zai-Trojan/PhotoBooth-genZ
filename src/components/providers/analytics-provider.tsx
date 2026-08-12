"use client";

import posthog from "posthog-js";
import { useEffect, type ReactNode } from "react";

export function AnalyticsProvider({ children }: { children: ReactNode }) {
  useEffect(() => {
    const key = process.env.NEXT_PUBLIC_POSTHOG_KEY;
    if (!key || posthog.__loaded) return;
    posthog.init(key, {
      api_host: process.env.NEXT_PUBLIC_POSTHOG_HOST || "https://us.i.posthog.com",
      defaults: "2025-11-30",
      capture_pageview: true,
      persistence: "localStorage+cookie",
    });
  }, []);

  return children;
}
