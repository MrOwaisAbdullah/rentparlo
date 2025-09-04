"use client";

import { Button } from "@/components/ui/button";

interface RetryButtonProps {
  onRetry?: () => void;
  children?: React.ReactNode;
  className?: string;
}

export function RetryButton({
  onRetry = () => window.location.reload(),
  children = "Retry",
  className,
}: RetryButtonProps) {
  return (
    <Button onClick={onRetry} className={className}>
      {children}
    </Button>
  );
}
