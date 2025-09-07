'use client';

import React, { useEffect } from "react";
import { cn } from "@/lib/utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useSidebar, SidebarContent } from "@/contexts/sidebar-context";
import { AdBanner } from "./ad-banner";
import { RelatedContent } from "./related-content";
import { CategoryFilters } from "@/components/category/category-filters";

export interface UniversalSidebarProps {
  pageType: "search" | "category" | "blog";
  pageContext?: Record<string, any>;
  onContentClick?: (contentId: string, contentType: string) => void;
  onNavigate?: () => void;
  className?: string;
}

export function UniversalSidebar({
  pageType,
  pageContext = {},
  onContentClick,
  onNavigate,
  className,
}: UniversalSidebarProps) {
  const { sidebarState, loadSidebarContent, trackInteraction } = useSidebar();

  useEffect(() => {
    loadSidebarContent(pageType, pageContext);
  }, [pageType, pageContext, loadSidebarContent]);

  const handleContentClick = React.useCallback((contentId: string, contentType: string) => {
    trackInteraction({
      contentId,
      contentType,
      action: "click",
      timestamp: new Date(),
      metadata: { pageType, pageContext },
    });
    onContentClick?.(contentId, contentType);
  }, [trackInteraction, pageType, pageContext, onContentClick]);

  const handleContentView = React.useCallback((contentId: string, contentType: string) => {
    trackInteraction({
      contentId,
      contentType,
      action: "view",
      timestamp: new Date(),
      metadata: { pageType, pageContext },
    });
  }, [trackInteraction, pageType, pageContext]);

  if (sidebarState.isLoading) {
    return (
      <div className={cn("space-y-6", className)}>
        <SidebarSkeleton />
      </div>
    );
  }

  if (sidebarState.error) {
    return (
      <div className={cn("space-y-6", className)}>
        <Card>
          <CardContent className="p-6">
            <p className="text-sm text-muted-foreground">Error loading content</p>
          </CardContent>
        </Card>
      </div>
    );
  }

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
      {Object.entries(contentByPosition).map(([position, contents]) => (
        <div key={position}>
          {contents.map((content) => (
            <SidebarContentRenderer
              key={content.id}
              content={content}
              onContentClick={handleContentClick}
              onContentView={handleContentView}
              onNavigate={onNavigate}
            />
          ))}
        </div>
      ))}
      {sidebarState.content.length === 0 && (
        <Card>
          <CardContent className="p-6">
            <p className="text-sm text-muted-foreground text-center">No content</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

function SidebarContentRenderer({
  content,
  onContentClick,
  onContentView,
  onNavigate,
}: {
  content: SidebarContent;
  onContentClick: (contentId: string, contentType: string) => void;
  onContentView: (contentId: string, contentType: string) => void;
  onNavigate?: () => void;
}) {
  useEffect(() => {
    onContentView(content.id, content.type);
  }, [content.id, content.type, onContentView]);

  switch (content.type) {
    case "ad":
      return <AdBanner banner={content.data} onBannerClick={() => onContentClick(content.id, content.type)} />;
    case "related-posts":
    case "popular-listings":
    case "categories":
      return (
        <RelatedContent
          contentType={content.type.replace(/-/g, ' ').slice(0, -1) as any}
          items={content.data.items || []}
          title={content.title}
          maxItems={content.data.limit || 5}
          onItemClick={(itemId) => onContentClick(itemId, content.type)}
        />
      );
    case "filters":
      return (
        <div className="hidden md:block">
          <Card>
            <CardHeader>
              <CardTitle>{content.title || "Filters"}</CardTitle>
            </CardHeader>
            <CardContent>
              <CategoryFilters
                slug={content.data.slug || "search"}
                currentFilters={content.data.currentFilters || {}}
                subcategories={content.data.subcategories || []}
                onNavigate={onNavigate}
              />
            </CardContent>
          </Card>
        </div>
      );
    default:
      return null;
  }
}

function SidebarSkeleton() {
  return (
    <Card>
      <CardHeader>
        <Skeleton className="h-5 w-3/4" />
      </CardHeader>
      <CardContent className="space-y-3">
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-5/6" />
      </CardContent>
    </Card>
  );
}
