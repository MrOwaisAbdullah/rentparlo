"use client";

import { useState, useEffect } from "react";
import { useIsMobile } from "@/hooks/use-mobile";
import { cn } from "@/lib/utils";

interface MobileResponsiveWrapperProps {
  children: React.ReactNode;
  className?: string;
  mobileClassName?: string;
  desktopClassName?: string;
}

export function MobileResponsiveWrapper({
  children,
  className,
  mobileClassName,
  desktopClassName,
}: MobileResponsiveWrapperProps) {
  const isMobile = useIsMobile();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return <div className={className}>{children}</div>;
  }

  return (
    <div
      className={cn(className, isMobile ? mobileClassName : desktopClassName)}
    >
      {children}
    </div>
  );
}
