import "./globals.css";
import Script from "next/script";

export const metadata = {
  title: "Trackie — Real-Time Analytics Platform",
  description:
    "Lightweight ad-tech telemetry system capturing page views, performance metrics, and user interactions with a beautiful analytics dashboard.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        {children}
        {/* Client-side telemetry tracker */}
        <Script src="/tracker.js" strategy="afterInteractive" />
      </body>
    </html>
  );
}
