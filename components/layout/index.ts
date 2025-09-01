// Layout components for the unified search system
export {
  UniversalPageLayout,
  ResponsiveContainer,
} from "./universal-page-layout";
export { UniversalSidebar } from "./universal-sidebar";
export { AdBanner, defaultAdBanners } from "./ad-banner";
export { RelatedContent, defaultRelatedContent } from "./related-content";

// Re-export types
export type { UniversalPageLayoutProps } from "./universal-page-layout";
export type { UniversalSidebarProps } from "./universal-sidebar";
export type { AdBanner as AdBannerType, AdBannerProps } from "./ad-banner";
export type { RelatedItem, RelatedContentProps } from "./related-content";
