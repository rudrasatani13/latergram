import { Component, type ErrorInfo, type ReactNode } from "react";
import { trackError } from "../analytics/analytics";

interface AppErrorBoundaryProps {
  children: ReactNode;
}

interface AppErrorBoundaryState {
  hasError: boolean;
}

export class AppErrorBoundary extends Component<AppErrorBoundaryProps, AppErrorBoundaryState> {
  state: AppErrorBoundaryState = { hasError: false };

  static getDerivedStateFromError(): AppErrorBoundaryState {
    return { hasError: true };
  }

  componentDidCatch(error: unknown, info: ErrorInfo) {
    trackError("app_render_error");

    console.error("Unexpected Latergram render error", {
      message: error instanceof Error ? error.message : "Unknown render error",
      componentStack: info.componentStack,
    });
  }

  private reset = () => {
    this.setState({ hasError: false });
  };

  render() {
    if (!this.state.hasError) {
      return this.props.children;
    }

    return (
      <main className="min-h-screen bg-[var(--lg-cream)] px-4 py-12 sm:px-6 md:px-12 flex items-center justify-center">
        <section className="w-full max-w-[560px] rounded-2xl border border-dashed border-[var(--lg-border)] bg-[var(--lg-paper)] px-5 py-8 text-center shadow-[0_18px_70px_-42px_rgba(120,80,70,0.55)]">
          <p className="font-cute text-[var(--lg-rose)]" style={{ fontSize: "1.25rem" }}>
            Something interrupted this page.
          </p>
          <h1
            className="mt-3 text-[var(--lg-ink)]"
            style={{
              fontFamily: "'Fraunces', serif",
              fontWeight: 400,
              fontSize: "clamp(2rem, 6vw, 3.2rem)",
              lineHeight: 1.05,
            }}
          >
            The app needs a fresh page.
          </h1>
          <p className="mx-auto mt-5 max-w-[28rem] font-cute text-[var(--lg-cocoa)]" style={{ fontSize: "1.05rem", lineHeight: 1.55 }}>
            Your private content is not shown in this error screen. Go back to writing and restore any local draft if one was saved on this device.
          </p>
          <div className="mt-7 flex flex-col sm:flex-row items-center justify-center gap-3">
            <a
              href="/app"
              onClick={this.reset}
              className="min-h-12 inline-flex items-center justify-center rounded-full bg-[var(--lg-ink)] px-6 py-3 text-[var(--lg-cream)] hover:bg-[var(--lg-rose)] transition-colors duration-500"
              style={{ fontSize: "0.82rem", letterSpacing: "0.16em", textTransform: "uppercase" }}
            >
              Go back to writing
            </a>
            <button
              type="button"
              onClick={this.reset}
              className="min-h-11 inline-flex items-center justify-center font-cute text-[var(--lg-rose)] hover:text-[var(--lg-focus-rose)] underline decoration-[var(--lg-rose-soft)] underline-offset-4 transition-colors duration-500"
              style={{ fontSize: "1.05rem" }}
            >
              Try this page again
            </button>
          </div>
        </section>
      </main>
    );
  }
}
