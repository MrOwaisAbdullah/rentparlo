"use client";

import React from "react";
import { cn } from "@/lib/utils";

export interface ResponsiveContainerProps {
  children: React.ReactNode;
  className?: string;
  maxWidth?:
    | "sm"
    | "md"
    | "lg"
    | "xl"
    | "2xl"
    | "3xl"
    | "4xl"
    | "5xl"
    | "6xl"
    | "7xl"
    | "full";
  padding?: "none" | "sm" | "default" | "lg" | "xl";
  preventHorizontalScroll?: boolean;
  breakpointBehavior?: "stack" | "wrap" | "scroll";
}

/**
 * Responsive container component for consistent layout management
 * Prevents horizontal scrolling and ensures proper content wrapping across all screen sizes
 */
export function ResponsiveContainer({
  children,
  className,
  maxWidth = "7xl",
  padding = "default",
  preventHorizontalScroll = true,
  breakpointBehavior = "wrap",
  ...props
}: ResponsiveContainerProps & React.HTMLAttributes<HTMLDivElement>) {
  const maxWidthClasses = {
    sm: "max-w-sm",
    md: "max-w-md",
    lg: "max-w-lg",
    xl: "max-w-xl",
    "2xl": "max-w-2xl",
    "3xl": "max-w-3xl",
    "4xl": "max-w-4xl",
    "5xl": "max-w-5xl",
    "6xl": "max-w-6xl",
    "7xl": "max-w-7xl",
    full: "max-w-full",
  };

  const paddingClasses = {
    none: "",
    sm: "px-2 sm:px-3",
    default: "px-4 sm:px-6 lg:px-8",
    lg: "px-6 sm:px-8 lg:px-12",
    xl: "px-8 sm:px-12 lg:px-16",
  };

  const behaviorClasses = {
    stack: "flex flex-col space-y-4",
    wrap: "flex flex-wrap gap-4",
    scroll: "flex overflow-x-auto scrollbar-hide",
  };

  return (
    <div
      {...props}
      className={cn(
        "w-full mx-auto",
        maxWidthClasses[maxWidth],
        paddingClasses[padding],
        preventHorizontalScroll && [
          "overflow-hidden", // Prevent horizontal scroll at container level
          "min-w-0", // Allow flex items to shrink below content size
        ],
        className
      )}
    >
      <div
        className={cn(
          preventHorizontalScroll && [
            "w-full",
            "box-border", // Include padding in width calculations
          ],
          breakpointBehavior !== "wrap" && behaviorClasses[breakpointBehavior]
        )}
      >
        {children}
      </div>
    </div>
  );
}

/**
 * Responsive grid container that prevents horizontal overflow
 */
export function ResponsiveGrid({
  children,
  className,
  columns = {
    mobile: 1,
    tablet: 2,
    desktop: 3,
    wide: 4,
  },
  gap = "default",
  preventOverflow = true,
  ...props
}: {
  children: React.ReactNode;
  className?: string;
  columns?: {
    mobile?: number;
    tablet?: number;
    desktop?: number;
    wide?: number;
  };
  gap?: "none" | "sm" | "default" | "lg";
  preventOverflow?: boolean;
} & React.HTMLAttributes<HTMLDivElement>) {
  const gapClasses = {
    none: "gap-0",
    sm: "gap-2 sm:gap-3",
    default: "gap-4 sm:gap-6",
    lg: "gap-6 sm:gap-8",
  };

  const gridColsClasses = {
    1: "grid-cols-1",
    2: "grid-cols-2",
    3: "grid-cols-3",
    4: "grid-cols-4",
    5: "grid-cols-5",
    6: "grid-cols-6",
  };

  return (
    <div
      {...props}
      className={cn(
        "grid w-full",
        gapClasses[gap],
        // Mobile columns
        gridColsClasses[columns.mobile || 1],
        // Tablet columns (md breakpoint)
        columns.tablet && `md:${gridColsClasses[columns.tablet]}`,
        // Desktop columns (lg breakpoint)
        columns.desktop && `lg:${gridColsClasses[columns.desktop]}`,
        // Wide screen columns (xl breakpoint)
        columns.wide && `xl:${gridColsClasses[columns.wide]}`,
        preventOverflow && ["overflow-hidden", "min-w-0"],
        className
      )}
    >
      {children}
    </div>
  );
}

/**
 * Responsive flex container with overflow prevention
 */
export function ResponsiveFlex({
  children,
  className,
  direction = "row",
  wrap = true,
  align = "start",
  justify = "start",
  gap = "default",
  preventOverflow = true,
  ...props
}: {
  children: React.ReactNode;
  className?: string;
  direction?: "row" | "col" | "row-reverse" | "col-reverse";
  wrap?: boolean;
  align?: "start" | "center" | "end" | "stretch" | "baseline";
  justify?: "start" | "center" | "end" | "between" | "around" | "evenly";
  gap?: "none" | "sm" | "default" | "lg";
  preventOverflow?: boolean;
} & React.HTMLAttributes<HTMLDivElement>) {
  const directionClasses = {
    row: "flex-row",
    col: "flex-col",
    "row-reverse": "flex-row-reverse",
    "col-reverse": "flex-col-reverse",
  };

  const alignClasses = {
    start: "items-start",
    center: "items-center",
    end: "items-end",
    stretch: "items-stretch",
    baseline: "items-baseline",
  };

  const justifyClasses = {
    start: "justify-start",
    center: "justify-center",
    end: "justify-end",
    between: "justify-between",
    around: "justify-around",
    evenly: "justify-evenly",
  };

  const gapClasses = {
    none: "gap-0",
    sm: "gap-2 sm:gap-3",
    default: "gap-4 sm:gap-6",
    lg: "gap-6 sm:gap-8",
  };

  return (
    <div
      {...props}
      className={cn(
        "flex w-full",
        directionClasses[direction],
        wrap && "flex-wrap",
        alignClasses[align],
        justifyClasses[justify],
        gapClasses[gap],
        preventOverflow && ["overflow-hidden", "min-w-0"],
        className
      )}
    >
      {children}
    </div>
  );
}

/**
 * Responsive breakpoint utilities
 */
export const breakpoints = {
  mobile: 320,
  tablet: 768,
  desktop: 1024,
  wide: 1440,
} as const;

/**
 * Hook to get current breakpoint
 */
export function useBreakpoint() {
  const [breakpoint, setBreakpoint] =
    React.useState<keyof typeof breakpoints>("mobile");

  React.useEffect(() => {
    const updateBreakpoint = () => {
      const width = window.innerWidth;
      if (width >= breakpoints.wide) {
        setBreakpoint("wide");
      } else if (width >= breakpoints.desktop) {
        setBreakpoint("desktop");
      } else if (width >= breakpoints.tablet) {
        setBreakpoint("tablet");
      } else {
        setBreakpoint("mobile");
      }
    };

    updateBreakpoint();
    window.addEventListener("resize", updateBreakpoint);
    return () => window.removeEventListener("resize", updateBreakpoint);
  }, []);

  return breakpoint;
}

/**
 * Responsive text utilities
 */
export function ResponsiveText({
  children,
  className,
  size = {
    mobile: "sm",
    tablet: "base",
    desktop: "lg",
  },
}: {
  children: React.ReactNode;
  className?: string;
  size?: {
    mobile?: "xs" | "sm" | "base" | "lg" | "xl";
    tablet?: "xs" | "sm" | "base" | "lg" | "xl";
    desktop?: "xs" | "sm" | "base" | "lg" | "xl";
  };
}) {
  const sizeClasses = {
    xs: "text-xs",
    sm: "text-sm",
    base: "text-base",
    lg: "text-lg",
    xl: "text-xl",
  };

  return (
    <span
      className={cn(
        // Mobile size
        sizeClasses[size.mobile || "sm"],
        // Tablet size
        size.tablet && `md:${sizeClasses[size.tablet]}`,
        // Desktop size
        size.desktop && `lg:${sizeClasses[size.desktop]}`,
        className
      )}
    >
      {children}
    </span>
  );
}
