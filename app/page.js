import Link from "next/link";
import styles from "./page.module.css";

export default function Home() {
  return (
    <div className={styles.page}>
      {/* Hero */}
      <div className={styles.hero}>
        <span className={styles.badge}>✦ Ad-Tech Telemetry System</span>
        <h1 className={styles.title}>
          Real-Time Analytics,
          <br />
          Zero Overhead.
        </h1>
        <p className={styles.subtitle}>
          A lightweight, privacy-first telemetry platform that captures page views,
          performance metrics, and user interactions — all funneled into a stunning
          live dashboard.
        </p>
        <div className={styles.actions}>
          <Link href="/dashboard" className={styles.primaryBtn} data-track="hero-dashboard-cta">
            Open Dashboard →
          </Link>
          <a
            href="#features"
            className={styles.secondaryBtn}
            data-track="hero-learn-more"
          >
            Learn More
          </a>
        </div>
      </div>

      {/* Features */}
      <div className={styles.features} id="features">
        <div className={styles.featureCard} data-track="feature-pageviews">
          <div className={styles.featureIcon}>📊</div>
          <h3>Page View Tracking</h3>
          <p>
            Every visit is captured with URL, timestamp, referrer, browser, and
            screen resolution.
          </p>
        </div>

        <div className={styles.featureCard} data-track="feature-performance">
          <div className={styles.featureIcon}>⚡</div>
          <h3>Performance Metrics</h3>
          <p>
            Time to Interactive, DOM Content Loaded, and full load times — all
            measured automatically.
          </p>
        </div>

        <div className={styles.featureCard} data-track="feature-clicks">
          <div className={styles.featureIcon}>🖱️</div>
          <h3>Click Interactions</h3>
          <p>
            Tag any element with <code>data-track</code> and it&apos;s instantly
            tracked in your dashboard.
          </p>
        </div>

        <div className={styles.featureCard} data-track="feature-privacy">
          <div className={styles.featureIcon}>🔒</div>
          <h3>Privacy First</h3>
          <p>
            Anonymous session IDs only — no cookies, no PII, no third-party
            scripts. GDPR-friendly by design.
          </p>
        </div>

        <div className={styles.featureCard} data-track="feature-serverless">
          <div className={styles.featureIcon}>☁️</div>
          <h3>Serverless Architecture</h3>
          <p>
            Built on Next.js API routes — deploy to Vercel and scale
            automatically. No servers to manage.
          </p>
        </div>

        <div className={styles.featureCard} data-track="feature-dashboard">
          <div className={styles.featureIcon}>📡</div>
          <h3>Live Dashboard</h3>
          <p>
            Beautiful dark-themed analytics with line charts, bar charts, pie
            charts, and auto-refresh.
          </p>
        </div>
      </div>

      {/* Footer */}
      <div className={styles.footer}>
        <p>
          Built with Next.js · MongoDB · Recharts — by{" "}
          <a href="#" data-track="footer-author-link">
            Keith Alan Speirs
          </a>
        </p>
      </div>
    </div>
  );
}
