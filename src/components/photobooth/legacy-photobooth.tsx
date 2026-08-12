"use client";

import Script from "next/script";

export function LegacyPhotobooth() {
  return (
    <>
      <div id="app" suppressHydrationWarning />
      <Script src="/legacy-app.js" strategy="afterInteractive" />
    </>
  );
}
