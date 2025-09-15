"use client";

import React, { Component, ErrorInfo, ReactNode } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import {
  AlertTriangle,
  RefreshCw,
  Bug,
  Home,
  Mail,
  ChevronDown,
  ChevronUp,
  Copy,
  ExternalLink,
} from "lucide-react";

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
  errorId: string;
  retryCount: number;
  showDetails: boolean;
}

interface ErrorBoundaryProps {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
  enableRetry?: boolean;
  maxRetries?: number;
  componentName?: string;
  showErrorDetails?: boolean;
}

interface ErrorReport {
  errorId: string;
  timestamp: string;
  componentName: string;
  error: {
    name: string;
    message: string;
    stack?: string;
  };
  errorInfo: {
    componentStack: string;
  };
  userAgent: string;
  url: string;
  userId?: string;
  sessionId?: string;
  buildVersion?: string;
}

export class DashboardErrorBoundary extends Component<
  ErrorBoundaryProps,
  ErrorBoundaryState
> {
  private retryTimeoutId: NodeJS.Timeout | null = null;

  constructor(props: ErrorBoundaryProps) {
    super(props);

    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
      errorId: "",
      retryCount: 0,
      showDetails: false,
    };
  }

  static getDerivedStateFromError(error: Error): Partial<ErrorBoundaryState> {
    const errorId = `ERR_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    return {
      hasError: true,
      error,
      errorId,
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    const { onError, componentName = "Unknown" } = this.props;

    this.setState({
      error,
      errorInfo,
    });

    // Log error to console in development
    if (process.env.NODE_ENV === "development") {
      console.group(`🚨 Error in ${componentName}`);
      console.error("Error:", error);
      console.error("Error Info:", errorInfo);
      console.groupEnd();
    }

    // Report error to monitoring service
    this.reportError(error, errorInfo);

    // Call custom error handler
    if (onError) {
      onError(error, errorInfo);
    }
  }

  private reportError = async (error: Error, errorInfo: ErrorInfo) => {
    const { componentName = "Unknown" } = this.props;
    const { errorId } = this.state;

    const errorReport: ErrorReport = {
      errorId,
      timestamp: new Date().toISOString(),
      componentName,
      error: {
        name: error.name,
        message: error.message,
        stack: error.stack,
      },
      errorInfo: {
        componentStack: errorInfo.componentStack,
      },
      userAgent: navigator.userAgent,
      url: window.location.href,
      buildVersion: process.env.NEXT_PUBLIC_BUILD_VERSION || "unknown",
    };

    try {
      // Send to monitoring service (replace with your actual service)
      await fetch("/api/errors", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(errorReport),
      });
    } catch (reportingError) {
      console.error("Failed to report error:", reportingError);
    }

    // Store in local storage for offline reporting
    try {
      const storedErrors = JSON.parse(
        localStorage.getItem("dashboard_errors") || "[]"
      );
      storedErrors.push(errorReport);

      // Keep only last 10 errors
      if (storedErrors.length > 10) {
        storedErrors.splice(0, storedErrors.length - 10);
      }

      localStorage.setItem("dashboard_errors", JSON.stringify(storedErrors));
    } catch (storageError) {
      console.error("Failed to store error locally:", storageError);
    }
  };

  private handleRetry = () => {
    const { maxRetries = 3 } = this.props;
    const { retryCount } = this.state;

    if (retryCount >= maxRetries) {
      return;
    }

    this.setState((prevState) => ({
      hasError: false,
      error: null,
      errorInfo: null,
      retryCount: prevState.retryCount + 1,
      showDetails: false,
    }));

    // Auto-retry with exponential backoff
    if (retryCount < maxRetries - 1) {
      const delay = Math.pow(2, retryCount) * 1000; // 1s, 2s, 4s
      this.retryTimeoutId = setTimeout(() => {
        // Component will re-render automatically
      }, delay);
    }
  };

  private handleGoHome = () => {
    window.location.href = "/dashboard";
  };

  private handleReportBug = () => {
    const { error, errorInfo, errorId } = this.state;
    const { componentName = "Unknown" } = this.props;

    const subject = encodeURIComponent(`Bug Report: Error in ${componentName}`);
    const body = encodeURIComponent(`
Error ID: ${errorId}
Component: ${componentName}
Error: ${error?.message}
URL: ${window.location.href}
Timestamp: ${new Date().toISOString()}

Please describe what you were doing when this error occurred:
[Your description here]

Technical Details:
${error?.stack}
${errorInfo?.componentStack}
    `);

    window.open(`mailto:support@rentparlo.pk?subject=${subject}&body=${body}`);
  };

  private toggleDetails = () => {
    this.setState((prevState) => ({
      showDetails: !prevState.showDetails,
    }));
  };

  private copyErrorDetails = async () => {
    const { error, errorInfo, errorId } = this.state;
    const { componentName = "Unknown" } = this.props;

    const errorDetails = `
Error ID: ${errorId}
Component: ${componentName}
Error: ${error?.message}
Stack: ${error?.stack}
Component Stack: ${errorInfo?.componentStack}
URL: ${window.location.href}
Timestamp: ${new Date().toISOString()}
    `;

    try {
      await navigator.clipboard.writeText(errorDetails);
      // You could show a toast notification here
    } catch (err) {
      console.error("Failed to copy error details:", err);
    }
  };

  componentWillUnmount() {
    if (this.retryTimeoutId) {
      clearTimeout(this.retryTimeoutId);
    }
  }

  render() {
    const {
      children,
      fallback,
      enableRetry = true,
      maxRetries = 3,
      componentName = "Dashboard Component",
      showErrorDetails = true,
    } = this.props;

    const { hasError, error, errorInfo, errorId, retryCount, showDetails } =
      this.state;

    if (hasError) {
      // Custom fallback UI
      if (fallback) {
        return fallback;
      }

      const canRetry = enableRetry && retryCount < maxRetries;
      const isProduction = process.env.NODE_ENV === "production";

      return (
        <Card className="border-destructive">
          <CardHeader>
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-destructive" />
              <CardTitle className="text-destructive">
                Something went wrong
              </CardTitle>
              <Badge variant="outline" className="text-xs">
                {errorId}
              </Badge>
            </div>
          </CardHeader>

          <CardContent className="space-y-4">
            <Alert variant="destructive">
              <AlertTriangle className="h-4 w-4" />
              <AlertTitle>Error in {componentName}</AlertTitle>
              <AlertDescription>
                {isProduction
                  ? "We're sorry, but something unexpected happened. Our team has been notified."
                  : error?.message || "An unexpected error occurred"}
              </AlertDescription>
            </Alert>

            {/* Action Buttons */}
            <div className="flex flex-wrap gap-2">
              {canRetry && (
                <Button onClick={this.handleRetry} variant="default" size="sm">
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Try Again ({maxRetries - retryCount} left)
                </Button>
              )}

              <Button onClick={this.handleGoHome} variant="outline" size="sm">
                <Home className="h-4 w-4 mr-2" />
                Go to Dashboard
              </Button>

              <Button
                onClick={this.handleReportBug}
                variant="outline"
                size="sm"
              >
                <Mail className="h-4 w-4 mr-2" />
                Report Bug
              </Button>

              {showErrorDetails && !isProduction && (
                <Button onClick={this.toggleDetails} variant="ghost" size="sm">
                  {showDetails ? (
                    <>
                      <ChevronUp className="h-4 w-4 mr-2" />
                      Hide Details
                    </>
                  ) : (
                    <>
                      <ChevronDown className="h-4 w-4 mr-2" />
                      Show Details
                    </>
                  )}
                </Button>
              )}
            </div>

            {/* Error Details (Development only) */}
            {showDetails && !isProduction && (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-medium">Error Details</h4>
                  <Button
                    onClick={this.copyErrorDetails}
                    variant="ghost"
                    size="sm"
                  >
                    <Copy className="h-4 w-4 mr-2" />
                    Copy
                  </Button>
                </div>

                <div className="bg-muted p-3 rounded-md text-xs font-mono overflow-auto max-h-40">
                  <div className="space-y-2">
                    <div>
                      <strong>Error:</strong> {error?.name}: {error?.message}
                    </div>

                    {error?.stack && (
                      <div>
                        <strong>Stack Trace:</strong>
                        <pre className="whitespace-pre-wrap mt-1">
                          {error.stack}
                        </pre>
                      </div>
                    )}

                    {errorInfo?.componentStack && (
                      <div>
                        <strong>Component Stack:</strong>
                        <pre className="whitespace-pre-wrap mt-1">
                          {errorInfo.componentStack}
                        </pre>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Retry Information */}
            {retryCount > 0 && (
              <div className="text-sm text-muted-foreground">
                Retry attempt: {retryCount} of {maxRetries}
              </div>
            )}
          </CardContent>
        </Card>
      );
    }

    return children;
  }
}

// Higher-order component for wrapping components with error boundary
export function withErrorBoundary<P extends object>(
  Component: React.ComponentType<P>,
  errorBoundaryProps?: Omit<ErrorBoundaryProps, "children">
) {
  const WrappedComponent = (props: P) => (
    <DashboardErrorBoundary {...errorBoundaryProps}>
      <Component {...props} />
    </DashboardErrorBoundary>
  );

  WrappedComponent.displayName = `withErrorBoundary(${Component.displayName || Component.name})`;

  return WrappedComponent;
}

// Hook for error reporting in functional components
export function useErrorReporting() {
  const reportError = React.useCallback((error: Error, context?: string) => {
    const errorReport = {
      errorId: `ERR_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      timestamp: new Date().toISOString(),
      componentName: context || "Unknown",
      error: {
        name: error.name,
        message: error.message,
        stack: error.stack,
      },
      userAgent: navigator.userAgent,
      url: window.location.href,
    };

    // Log to console in development
    if (process.env.NODE_ENV === "development") {
      console.error("Reported error:", errorReport);
    }

    // Send to monitoring service
    fetch("/api/errors", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(errorReport),
    }).catch((reportingError) => {
      console.error("Failed to report error:", reportingError);
    });
  }, []);

  return { reportError };
}

export default DashboardErrorBoundary;
