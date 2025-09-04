"use client";

import React, {
  createContext,
  useContext,
  useReducer,
  useCallback,
  useEffect,
} from "react";
import { CategoryFilters } from "@/components/category/category-filters";

// Sidebar content types
export interface SidebarContent {
  id: string;
  type: "ad" | "related-posts" | "popular-listings" | "categories" | "filters" | "custom";
  title?: string;
  data: any;
  priority: number;
  position?: "top" | "middle" | "bottom";
}

export interface SidebarInteraction {
  contentId: string;
  contentType: string;
  action: "view" | "click" | "hover";
  timestamp: Date;
  metadata?: Record<string, any>;
}

export interface SidebarState {
  // Current page context
  pageType: "search" | "category" | "blog";
  pageContext: Record<string, any>;

  // Sidebar content
  content: SidebarContent[];

  // Loading state
  isLoading: boolean;
  error: string | null;

  // User interactions
  interactions: SidebarInteraction[];
}

// Initial state
const initialSidebarState: SidebarState = {
  pageType: "search",
  pageContext: {},
  content: [],
  isLoading: false,
  error: null,
  interactions: [],
};

// Action types
type SidebarAction =
  | { type: "SET_PAGE_TYPE"; payload: "search" | "category" | "blog" }
  | { type: "SET_PAGE_CONTEXT"; payload: Record<string, any> }
  | { type: "SET_CONTENT"; payload: SidebarContent[] }
  | { type: "ADD_CONTENT"; payload: SidebarContent }
  | { type: "REMOVE_CONTENT"; payload: string }
  | { type: "SET_LOADING"; payload: boolean }
  | { type: "SET_ERROR"; payload: string | null }
  | { type: "TRACK_INTERACTION"; payload: SidebarInteraction }
  | { type: "CLEAR_CONTENT" }
  | { type: "RESET_STATE" };

// Reducer
function sidebarReducer(
  state: SidebarState,
  action: SidebarAction
): SidebarState {
  switch (action.type) {
    case "SET_PAGE_TYPE":
      return {
        ...state,
        pageType: action.payload,
      };

    case "SET_PAGE_CONTEXT":
      return {
        ...state,
        pageContext: action.payload,
      };

    case "SET_CONTENT":
      return {
        ...state,
        content: action.payload.sort((a, b) => b.priority - a.priority),
        isLoading: false,
        error: null,
      };

    case "ADD_CONTENT":
      const newContent = [...state.content, action.payload].sort(
        (a, b) => b.priority - a.priority
      );
      return {
        ...state,
        content: newContent,
      };

    case "REMOVE_CONTENT":
      return {
        ...state,
        content: state.content.filter((item) => item.id !== action.payload),
      };

    case "SET_LOADING":
      return {
        ...state,
        isLoading: action.payload,
        error: action.payload ? null : state.error,
      };

    case "SET_ERROR":
      return {
        ...state,
        error: action.payload,
        isLoading: false,
      };

    case "TRACK_INTERACTION":
      return {
        ...state,
        interactions: [...state.interactions, action.payload],
      };

    case "CLEAR_CONTENT":
      return {
        ...state,
        content: [],
      };

    case "RESET_STATE":
      return {
        ...initialSidebarState,
      };

    default:
      return state;
  }
}

// Context interface
export interface SidebarContextValue {
  sidebarState: SidebarState;
  loadSidebarContent: (
    pageType: "search" | "category" | "blog",
    pageContext: Record<string, any>
  ) => Promise<void>;
  trackInteraction: (interaction: SidebarInteraction) => void;
  updateContent: (content: SidebarContent[]) => void;
  addContent: (content: SidebarContent) => void;
  removeContent: (contentId: string) => void;
  clearContent: () => void;
}

// Context
const SidebarContext = createContext<SidebarContextValue | undefined>(
  undefined
);

// Provider props
interface SidebarProviderProps {
  children: React.ReactNode;
  contentLoader?: (
    pageType: string,
    pageContext: Record<string, any>
  ) => Promise<SidebarContent[]>;
}

// Helper functions for mock data
const getAdDescription = (pageType: string): string => {
  switch (pageType) {
    case "search":
      return "Reach thousands of potential customers searching for rental items";
    case "category":
      return "Become a category sponsor and boost your visibility";
    case "blog":
      return "Grow your business with targeted content marketing";
    default:
      return "Advertise your products and services here";
  }
};

const getPopularListings = () => [
  {
    id: "listing-1",
    title: "Professional Camera for Rent",
    linkUrl: "/listing/camera-rent",
    imageUrl: "/samples/camera.jpg",
    description: "High-quality DSLR camera perfect for events",
    metadata: { price: 5000, location: "Karachi" },
  },
  {
    id: "listing-2",
    title: "Luxury Car Rental",
    linkUrl: "/listing/car-rent",
    imageUrl: "/samples/car.jpg",
    description: "Premium sedan for special occasions",
    metadata: { price: 15000, location: "Lahore" },
  },
  {
    id: "listing-3",
    title: "Wedding Decoration Package",
    linkUrl: "/listing/wedding-decor",
    imageUrl: "/samples/decoration.jpg",
    description: "Complete wedding decoration setup",
    metadata: { price: 25000, location: "Islamabad" },
  },
];

const getRelatedCategories = (categoryId?: string, currentSlug?: string) => {
  const allCategories = [
    {
      id: "cat-electronics",
      title: "Electronics",
      linkUrl: "/category/electronics",
      description: "Cameras, laptops, and more",
      metadata: { itemCount: 150, trending: true },
    },
    {
      id: "cat-vehicles",
      title: "Vehicles",
      linkUrl: "/category/vehicles",
      description: "Cars, bikes, and transport",
      metadata: { itemCount: 89 },
    },
    {
      id: "cat-events",
      title: "Event Equipment",
      linkUrl: "/category/events",
      description: "Sound systems, decorations",
      metadata: { itemCount: 67, trending: true },
    },
    {
      id: "cat-furniture",
      title: "Furniture",
      linkUrl: "/category/furniture",
      description: "Tables, chairs, and decor",
      metadata: { itemCount: 45 },
    },
    {
      id: "cat-sports",
      title: "Sports Equipment",
      linkUrl: "/category/sports",
      description: "Fitness and outdoor gear",
      metadata: { itemCount: 78, trending: true },
    },
  ];

  // Filter out current category and return related ones
  return allCategories
    .filter((cat) => !currentSlug || !cat.linkUrl.includes(currentSlug))
    .slice(0, 4);
};

const getPopularInCategory = (categorySlug?: string) => [
  {
    id: `${categorySlug}-listing-1`,
    title: `Premium ${categorySlug} Item`,
    linkUrl: `/listing/${categorySlug}-premium`,
    imageUrl: "/samples/premium.jpg",
    description: `High-quality ${categorySlug} rental`,
    metadata: { price: 8000, location: "Karachi", featured: true },
  },
  {
    id: `${categorySlug}-listing-2`,
    title: `Popular ${categorySlug} Item`,
    linkUrl: `/listing/${categorySlug}-popular`,
    imageUrl: "/samples/popular.jpg",
    description: `Trending ${categorySlug} rental`,
    metadata: { price: 6000, location: "Lahore", featured: false },
  },
];

const getRelatedPosts = () => [
  {
    id: "post-1",
    title: "How to Choose the Right Rental Equipment",
    linkUrl: "/blog/choose-rental-equipment",
    description:
      "A comprehensive guide to selecting the best rental items for your needs.",
    metadata: { publishedAt: "2024-01-15", views: 1250 },
  },
  {
    id: "post-2",
    title: "Top 10 Rental Tips for Beginners",
    linkUrl: "/blog/rental-tips-beginners",
    description: "Essential tips for first-time renters in Pakistan.",
    metadata: { publishedAt: "2024-01-10", views: 890 },
  },
  {
    id: "post-3",
    title: "Rental Business Trends in 2024",
    linkUrl: "/blog/rental-trends-2024",
    description: "Latest trends shaping the rental industry.",
    metadata: { publishedAt: "2024-01-05", views: 1450 },
  },
];

const getBlogCategories = () => [
  {
    id: "blog-cat-electronics",
    title: "Electronics",
    linkUrl: "/blog/category/electronics",
    description: "Tech and gadget rental guides",
    metadata: { itemCount: 25, trending: true },
  },
  {
    id: "blog-cat-furniture",
    title: "Furniture",
    linkUrl: "/blog/category/furniture",
    description: "Home and office furniture tips",
    metadata: { itemCount: 18 },
  },
  {
    id: "blog-cat-market-insights",
    title: "Market Insights",
    linkUrl: "/blog/category/market-insights",
    description: "Industry trends and analysis",
    metadata: { itemCount: 12, trending: true },
  },
  {
    id: "blog-cat-rental-tips",
    title: "Rental Tips",
    linkUrl: "/blog/category/rental-tips",
    description: "Expert advice for renters",
    metadata: { itemCount: 20 },
  },
];

// Default content loader
const defaultContentLoader = async (
  pageType: string,
  pageContext: Record<string, any>
): Promise<SidebarContent[]> => {
  // Mock content based on page type
  const mockContent: SidebarContent[] = [];

  // Add page-specific content
  switch (pageType) {
    case "search":
      // Add advertisement content
      mockContent.push({
        id: `ad-${pageType}-1`,
        type: "ad",
        title: "Advertisement",
        data: {
          id: `ad-${pageType}-1`,
          title: "Premium Ad Space",
          imageUrl: "",
          linkUrl: "/advertise",
          altText: "Advertise with us",
          priority: 100,
          description: getAdDescription(pageType),
          ctaText: "Learn More",
        },
        priority: 100,
        position: "top",
      });
      
      // Add search filters
      mockContent.push({
        id: "search-filters",
        type: "filters",
        title: "Search Filters",
        data: {
          filters: pageContext.filters || {},
          categories: pageContext.categories || [],
        },
        priority: 90,
        position: "top",
      });

      mockContent.push({
        id: "popular-listings",
        type: "popular-listings",
        title: "Popular Listings",
        data: {
          items: getPopularListings(),
          limit: 5,
        },
        priority: 80,
        position: "middle",
      });
      break;

    case "category":
      // Add one category-specific ad at the top (highest priority)
      mockContent.push({
        id: `category-ad-top-${pageContext.categorySlug}`,
        type: "ad",
        title: "Premium Ad Space",
        data: {
          id: `category-ad-top-${pageContext.categorySlug}`,
          title: "Premium Ad Space",
          imageUrl: "",
          linkUrl: "/advertise",
          altText: "Advertise with us",
          priority: 100,
          description: "Reach thousands of potential customers in this category",
          ctaText: "Learn More",
        },
        priority: 100,
        position: "top",
      });

      // Add category filters (second highest priority)
      mockContent.push({
        id: "category-filters",
        type: "filters",
        title: "Category Filters",
        data: {
          slug: pageContext.categorySlug,
          currentFilters: pageContext.filters || {},
          subcategories: pageContext.subcategories || [],
        },
        priority: 95,
        position: "top",
      });

      // Add second category-specific ad after filters (middle position, lower priority)
      mockContent.push({
        id: `category-ad-middle-${pageContext.categorySlug}`,
        type: "ad",
        title: "Category Sponsor",
        data: {
          id: `category-ad-middle-${pageContext.categorySlug}`,
          title: `${pageContext.categoryTitle} Sponsor`,
          imageUrl: "",
          linkUrl: `/sponsor?category=${pageContext.categorySlug}`,
          altText: `Sponsor ${pageContext.categoryTitle} category`,
          priority: 90,
          description: `Become the official sponsor of ${pageContext.categoryTitle} category`,
          ctaText: "Sponsor Now",
        },
        priority: 90,
        position: "middle",
      });

      mockContent.push({
        id: "related-categories",
        type: "categories",
        title: "Related Categories",
        data: {
          items: getRelatedCategories(
            pageContext.categoryId,
            pageContext.categorySlug
          ),
          categoryId: pageContext.categoryId,
          limit: 5,
        },
        priority: 80,
        position: "middle",
      });

      // Add popular listings in this category
      mockContent.push({
        id: "popular-in-category",
        type: "popular-listings",
        title: `Popular in ${pageContext.categoryTitle}`,
        data: {
          items: getPopularInCategory(pageContext.categorySlug),
          categorySlug: pageContext.categorySlug,
          limit: 4,
        },
        priority: 75,
        position: "bottom",
      });
      break;

    case "blog":
      // Add blog-focused advertisement banners
      mockContent.push({
        id: "blog-ad-content",
        type: "ad",
        title: "Blog Advertisement",
        data: {
          id: "blog-ad-content",
          title: "Content Marketing",
          imageUrl: "",
          linkUrl: "/content-marketing",
          altText: "Content marketing services",
          priority: 95,
          description:
            "Blog-focused advertisement banners - Grow your business with content",
          ctaText: "Get Started",
        },
        priority: 95,
        position: "top",
      });

      // Related blog posts and popular articles
      mockContent.push({
        id: "related-posts",
        type: "related-posts",
        title: "Related Posts",
        data: {
          items: getRelatedPosts(),
          limit: 5,
          description: "Related blog posts and popular articles",
        },
        priority: 80,
        position: "middle",
      });

      // Blog categories and tag cloud
      mockContent.push({
        id: "blog-categories",
        type: "categories",
        title: "Blog Categories",
        data: {
          items: getBlogCategories(),
          limit: 6,
          description: "Blog categories and tag cloud",
        },
        priority: 75,
        position: "bottom",
      });
      break;
  }

  return mockContent;
};

// Provider component
export function SidebarProvider({
  children,
  contentLoader,
}: SidebarProviderProps) {
  const [state, dispatch] = useReducer(sidebarReducer, initialSidebarState);

  const activeContentLoader = contentLoader || defaultContentLoader;

  // Actions
  const loadSidebarContent = useCallback(
    async (
      pageType: "search" | "category" | "blog",
      pageContext: Record<string, any>
    ) => {
      dispatch({ type: "SET_LOADING", payload: true });
      dispatch({ type: "SET_PAGE_TYPE", payload: pageType });
      dispatch({ type: "SET_PAGE_CONTEXT", payload: pageContext });

      try {
        const content = await activeContentLoader(pageType, pageContext);
        dispatch({ type: "SET_CONTENT", payload: content });
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : "Failed to load content";
        dispatch({ type: "SET_ERROR", payload: errorMessage });
      }
    },
    [activeContentLoader]
  );

  const trackInteraction = useCallback((interaction: SidebarInteraction) => {
    dispatch({ type: "TRACK_INTERACTION", payload: interaction });

    // Here you could also send analytics to your tracking service
    console.log("Sidebar interaction:", interaction);
  }, []);

  const updateContent = useCallback((content: SidebarContent[]) => {
    dispatch({ type: "SET_CONTENT", payload: content });
  }, []);

  const addContent = useCallback((content: SidebarContent) => {
    dispatch({ type: "ADD_CONTENT", payload: content });
  }, []);

  const removeContent = useCallback((contentId: string) => {
    dispatch({ type: "REMOVE_CONTENT", payload: contentId });
  }, []);

  const clearContent = useCallback(() => {
    dispatch({ type: "CLEAR_CONTENT" });
  }, []);

  const contextValue: SidebarContextValue = {
    sidebarState: state,
    loadSidebarContent,
    trackInteraction,
    updateContent,
    addContent,
    removeContent,
    clearContent,
  };

  return (
    <SidebarContext.Provider value={contextValue}>
      {children}
    </SidebarContext.Provider>
  );
}

// Hook to use sidebar context
export function useSidebar(): SidebarContextValue {
  const context = useContext(SidebarContext);
  if (context === undefined) {
    throw new Error("useSidebar must be used within a SidebarProvider");
  }
  return context;
}

// Hook to use sidebar state only
export function useSidebarState(): SidebarState {
  const { sidebarState } = useSidebar();
  return sidebarState;
}