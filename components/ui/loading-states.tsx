"use client";

import React from "react";
import { Loader2, Search, AlertCircle, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

interface LoadingSpinnerProps {
  size?: "sm" | "md" | "lg";
  className?: string;
}

export function LoadingSpinner({
  size = "md",
  className,
}: LoadingSpinnerProps) {
  const sizeClasses = {
    sm: "w-4 h-4",
    md: "w-6 h-6",
    lg: "w-8 h-8",
  };

  return (
    <Loader2
      className={cn(
        "animate-spin text-muted-foreground",
        sizeClasses[size],
        className
      )}
    />
  );
}

interface SearchLoadingProps {
  message?: string;
  showSpinner?: boolean;
  className?: string;
}

export function SearchLoading({
  message = "Searching...",
  showSpinner = true,
  className,
}: SearchLoadingProps) {
  return (
    <div className={cn("flex items-center justify-center py-8", className)}>
      <div className="flex items-center gap-3 text-muted-foreground">
        {showSpinner && <LoadingSpinner />}
        <span className="text-sm font-medium">{message}</span>
      </div>
    </div>
  );
}

interface FilterLoadingProps {
  count?: number;
  className?: string;
}

export function FilterLoading({ count = 3, className }: FilterLoadingProps) {
  return (
    <div className={cn("space-y-4", className)}>
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="space-y-2">
          <Skeleton className="h-4 w-20" />
          <Skeleton className="h-10 w-full" />
        </div>
      ))}
    </div>
  );
}

interface SearchResultsLoadingProps {
  count?: number;
  viewMode?: "grid" | "list" | "horizontal";
  className?: string;
}

export function SearchResultsLoading({
  count = 6,
  viewMode = "grid",
  className,
}: SearchResultsLoadingProps) {
  const gridClasses = {
    grid: "grid gap-6 md:grid-cols-2 lg:grid-cols-3",
    list: "space-y-4",
    horizontal: "space-y-6",
  };

  const itemClasses = {
    grid: "space-y-4",
    list: "flex gap-4",
    horizontal: "flex gap-6",
  };

  return (
    <div className={cn(gridClasses[viewMode], className)}>
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className={itemClasses[viewMode]}>
          {viewMode === "grid" ? (
            <>
              <Skeleton className="aspect-video w-full rounded-lg" />
              <div className="space-y-2">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-3 w-1/2" />
              </div>
            </>
          ) : (
            <>
              <Skeleton className="w-32 h-24 rounded-lg flex-shrink-0" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-3 w-1/2" />
              </div>
            </>
          )}
        </div>
      ))}
    </div>
  );
}

interface LoadMoreButtonProps {
  onLoadMore: () => void;
  isLoading?: boolean;
  hasMore?: boolean;
  error?: string | null;
  onRetry?: () => void;
  className?: string;
}

export function LoadMoreButton({
  onLoadMore,
  isLoading = false,
  hasMore = true,
  error = null,
  onRetry,
  className,
}: LoadMoreButtonProps) {
  if (error) {
    return (
      <div className={cn("text-center py-6", className)}>
        <div className="flex items-center justify-center gap-2 text-destructive mb-3">
          <AlertCircle className="w-4 h-4" />
          <span className="text-sm">{error}</span>
        </div>
        {onRetry && (
          <Button variant="outline" onClick={onRetry} size="sm">
            <RefreshCw className="w-4 h-4 mr-2" />
            Try Again
          </Button>
        )}
      </div>
    );
  }

  if (!hasMore) {
    return (
      <div className={cn("text-center py-6 text-muted-foreground", className)}>
        <span className="text-sm">No more results to load</span>
      </div>
    );
  }

  return (
    <div className={cn("text-center py-6", className)}>
      <Button
        variant="outline"
        onClick={onLoadMore}
        disabled={isLoading}
        className="min-w-32"
      >
        {isLoading ? (
          <>
            <LoadingSpinner size="sm" className="mr-2" />
            Loading...
          </>
        ) : (
          "Load More"
        )}
      </Button>
    </div>
  );
}

interface ErrorStateProps {
  title?: string;
  message?: string;
  onRetry?: () => void;
  retryLabel?: string;
  className?: string;
}

export function ErrorState({
  title = "Something went wrong",
  message = "We encountered an error while loading the content. Please try again.",
  onRetry,
  retryLabel = "Try Again",
  className,
}: ErrorStateProps) {
  return (
    <Card className={cn("border-destructive/20", className)}>
      <CardContent className="flex flex-col items-center justify-center py-12 text-center">
        <AlertCircle className="w-12 h-12 text-destructive mb-4" />
        <h3 className="text-lg font-semibold mb-2">{title}</h3>
        <p className="text-muted-foreground mb-6 max-w-md">{message}</p>
        {onRetry && (
          <Button variant="outline" onClick={onRetry}>
            <RefreshCw className="w-4 h-4 mr-2" />
            {retryLabel}
          </Button>
        )}
      </CardContent>
    </Card>
  );
}

interface EmptyStateProps {
  title?: string;
  message?: string;
  action?: React.ReactNode;
  icon?: React.ReactNode;
  className?: string;
}

export function EmptyState({
  title = "No results found",
  message = "Try adjusting your search criteria or clearing the filters.",
  action,
  icon,
  className,
}: EmptyStateProps) {
  return (
    <div className={cn("text-center py-12", className)}>
      <div className="max-w-md mx-auto">
        {icon || (
          <Search className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
        )}
        <h3 className="text-lg font-semibold mb-2">{title}</h3>
        <p className="text-muted-foreground mb-6">{message}</p>
        {action}
      </div>
    </div>
  );
}

interface ProgressIndicatorProps {
  progress: number;
  label?: string;
  className?: string;
}

export function ProgressIndicator({
  progress,
  label = "Loading...",
  className,
}: ProgressIndicatorProps) {
  return (
    <div className={cn("space-y-2", className)}>
      <div className="flex items-center justify-between text-sm">
        <span className="text-muted-foreground">{label}</span>
        <span className="font-medium">{Math.round(progress)}%</span>
      </div>
      <div className="w-full bg-muted rounded-full h-2">
        <div
          className="bg-primary h-2 rounded-full transition-all duration-300 ease-out"
          style={{ width: `${Math.min(100, Math.max(0, progress))}%` }}
        />
      </div>
    </div>
  );
}

interface InlineLoadingProps {
  text?: string;
  size?: "sm" | "md";
  className?: string;
}

export function InlineLoading({
  text = "Loading...",
  size = "sm",
  className,
}: InlineLoadingProps) {
  return (
    <div
      className={cn("flex items-center gap-2 text-muted-foreground", className)}
    >
      <LoadingSpinner size={size} />
      <span className={cn("text-sm", size === "md" && "text-base")}>
        {text}
      </span>
    </div>
  );
}

interface PulseLoadingProps {
  className?: string;
}

export function PulseLoading({ className }: PulseLoadingProps) {
  return (
    <div className={cn("flex space-x-1", className)}>
      {[0, 1, 2].map((i) => (
        <div
          key={i}
          className="w-2 h-2 bg-primary rounded-full animate-pulse"
          style={{
            animationDelay: `${i * 0.2}s`,
            animationDuration: "1s",
          }}
        />
      ))}
    </div>
  );
}
