import { Component } from "react";
import type { ErrorInfo, ReactNode } from "react";
import { Button } from "@/components/ui/button";

interface ErrorBoundaryProps {
  children: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error?: Error;
}

// Optional global error reporters (Sentry/PostHog) — typed loosely to avoid hard deps.
interface WindowWithReporters extends Window {
  Sentry?: { captureException?: (err: unknown) => void };
  posthog?: { capture?: (event: string, props?: Record<string, unknown>) => void };
}

export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    // eslint-disable-next-line no-console
    console.error("ErrorBoundary caught:", error, errorInfo);

    if (typeof window !== "undefined") {
      const w = window as WindowWithReporters;
      try {
        w.Sentry?.captureException?.(error);
      } catch {
        // ignore reporter failures
      }
      try {
        w.posthog?.capture?.("error_boundary_triggered", {
          message: error.message,
          stack: error.stack,
        });
      } catch {
        // ignore reporter failures
      }
    }
  }

  handleReload = (): void => {
    if (typeof window !== "undefined") {
      window.location.reload();
    }
  };

  render(): ReactNode {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-background px-4">
          <div className="max-w-md w-full text-center space-y-6">
            <h1 className="text-3xl font-bold tracking-tight">
              Что-то пошло не так
            </h1>
            <p className="text-muted-foreground">
              Произошла непредвиденная ошибка. Попробуйте обновить страницу — если проблема не уйдёт,
              свяжитесь с поддержкой.
            </p>
            <p className="text-sm text-muted-foreground">
              Something went wrong. Please reload the page and try again.
            </p>
            <div className="flex justify-center">
              <Button size="lg" onClick={this.handleReload}>
                Перезагрузить / Reload
              </Button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
