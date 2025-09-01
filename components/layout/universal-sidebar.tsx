"use client";

import React, { useEffect } from "react";
import { cn } from "@/lib/utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useSidebar, SidebarContent } from "@/contexts/sidebar-context";
import { AdBanner } from "./ad-banner";
import { RelatedContent } from "./related-content";

export interface UniversalSidebarProps {
  pageType: "search" | "category" | "blog";
  pageContext?: Record<string, any>;
  onContentClick?: (contentId: string, contentType: string) => void;
  className?: string;
}

/**
 * Universal sidebar component for displaying contextual content
 * Adapts content based on page type and context
 */
export function UniversalSidebar({
  pageType,
  pageContext = {},
  onContentClick,
  className,
}: UniversalSidebarProps) {
  const { sidebarState, loadSidebarContent, trackInteraction } = useSidebar();

  // Load sidebar content when page type or context changes
  useEffect(() => {
    loadSidebarContent(pageType, pageContext);
  }, [pageType, pageContext, loadSidebarContent]);

  // Handle content interactions
  const handleContentClick = (contentId: string, contentType: string) => {
    // Track the interaction
    trackInteraction({
      contentId,
      contentType,
      action: "click",
      timestamp: new Date(),
      metadata: { pageType, pageContext },
    });

    // Call external handler if provided
    onContentClick?.(contentId, contentType);
  };

  const handleContentView = (contentId: string, contentType: string) => {
    trackInteraction({
      contentId,
      contentType,
      action: "view",
      timestamp: new Date(),
      metadata: { pageType, pageContext },
    });
  };

  if (sidebarState.isLoading) {
    return (
      <div className={cn("space-y-6", className)}>
        <SidebarSkeleton />
        <SidebarSkeleton />
        <SidebarSkeleton />
      </div>
    );
  }

  if (sidebarState.error) {
    return (
      <div className={cn("space-y-6", className)}>
        <Card>
          <CardContent className="p-6">
            <p className="text-sm text-muted-foreground">
              Unable to load sidebar content
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Group content by position
  const contentByPosition = sidebarState.content.reduce(
    (acc, content) => {
      const position = content.position || "middle";
      if (!acc[position]) acc[position] = [];
      acc[position].push(content);
      return acc;
    },
    {} as Record<string, SidebarContent[]>
  );

  return (
    <div className={cn("space-y-6", className)}>
      {/* Top positioned content */}
      {contentByPosition.top?.map((content) => (
        <SidebarContentRenderer
          key={content.id}
          content={content}
          onContentClick={handleContentClick}
          onContentView={handleContentView}
        />
      ))}

      {/* Middle positioned content */}
      {contentByPosition.middle?.map((content) => (
        <SidebarContentRenderer
          key={content.id}
          content={content}
          onContentClick={handleContentClick}
          onContentView={handleContentView}
        />
      ))}

      {/* Bottom positioned content */}
      {contentByPosition.bottom?.map((content) => (
        <SidebarContentRenderer
          key={content.id}
          content={content}
          onContentClick={handleContentClick}
          onContentView={handleContentView}
        />
      ))}

      {/* Fallback content if no content is available */}
      {sidebarState.content.length === 0 && (
        <Card>
          <CardContent className="p-6">
            <p className="text-sm text-muted-foreground text-center">
              No content available
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

/**
 * Renders individual sidebar content based on its type
 */
function SidebarContentRenderer({
  content,
  onContentClick,
  onContentView,
}: {
  content: SidebarContent;
  onContentClick: (contentId: string, contentType: string) => void;
  onContentView: (contentId: string, contentType: string) => void;
}) {
  // Track view when component mounts
  useEffect(() => {
    onContentView(content.id, content.type);
  }, [content.id, content.type, onContentView]);

  switch (content.type) {
    case "ad":
      return (
        <AdBanner
          banner={content.data}
          onBannerClick={() => onContentClick(content.id, content.type)}
        />
      );

    case "related-posts":
    case "popular-listings":
    case "categories":
      return (
        <RelatedContent
          contentType={
            content.type === "related-posts"
              ? "posts"
              : content.type === "popular-listings"
                ? "listings"
                : "categories"
          }
          items={content.data.items || []}
          title={content.title}
          maxItems={content.data.limit || 5}
          onItemClick={(itemId) => onContentClick(itemId, content.type)}
        />
      );

    case "custom":
      return (
        <Card>
          <CardHeader>
            {content.title && <CardTitle>{content.title}</CardTitle>}
          </CardHeader>
          <CardContent>
            {/* Render custom content based on data structure */}
            <div className="text-sm text-muted-foreground">
              Custom content: {JSON.stringify(content.data)}
            </div>
          </CardContent>
        </Card>
      );

    default:
      return (
        <Card>
          <CardContent className="p-6">
            <p className="text-sm text-muted-foreground">
              Unknown content type: {content.type}
            </p>
          </CardContent>
        </Card>
      );
  }
}

/**
 * Skeleton loader for sidebar content
 */
function SidebarSkeleton() {
  return (
    <Card>
      <CardHeader>
        <Skeleton className="h-5 w-3/4" />
      </CardHeader>
      <CardContent className="space-y-3">
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-5/6" />
        <Skeleton className="h-4 w-4/5" />
        <div className="space-y-2">
          <Skeleton className="h-16 w-full" />
          <Skeleton className="h-16 w-full" />
          <Skeleton className="h-16 w-full" />
        </div>
      </CardContent>
    </Card>
  );
}
