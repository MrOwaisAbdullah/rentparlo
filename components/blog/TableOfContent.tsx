"use client";

import React, { useEffect, useState } from "react";
import { PortableTextBlock } from "@portabletext/types";
import { cn } from "@/lib/utils";
import { ChevronRight } from "lucide-react";

interface TOCItem {
  id: string;
  text: string;
  level: number;
  items?: TOCItem[];
}

interface TableOfContentsProps {
  content: PortableTextBlock[];
}

function buildTOCTree(items: TOCItem[]): TOCItem[] {
  const root: TOCItem[] = [];
  const stack: TOCItem[] = [];

  items.forEach((item) => {
    while (stack.length > 0 && stack[stack.length - 1].level >= item.level) {
      stack.pop();
    }

    if (stack.length === 0) {
      root.push(item);
    } else {
      const parent = stack[stack.length - 1];
      if (!parent.items) parent.items = [];
      parent.items.push(item);
    }
    stack.push(item);
  });

  return root;
}

function extractText(children: unknown): string {
  if (Array.isArray(children) && children[0]) {
    if (typeof children[0] === "string") {
      return children[0];
    }
    if (typeof children[0] === "object" && "props" in children[0]) {
      return (
        (children[0] as { props: { children?: string } }).props.children || ""
      );
    }
  }
  return "";
}

export function TableOfContents({ content }: TableOfContentsProps) {
  const [activeId, setActiveId] = useState<string>("");
  const [headings, setHeadings] = useState<TOCItem[]>([]);
  const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set());
  const [tocTree, setTocTree] = useState<TOCItem[]>([]);

  const toggleExpand = (id: string) => {
    setExpandedItems((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  // Extract headings from the portable text content
  useEffect(() => {
    const items: TOCItem[] = [];
    const numberedSections: { [key: number]: number } = {};
    content.forEach((block) => {
      if (block.style?.startsWith("h") && block.children?.[0]) {
        const level = parseInt(block.style[1]) || 1;
        Object.keys(numberedSections).forEach((key) => {
          if (parseInt(key) > level) {
            delete numberedSections[parseInt(key)];
          }
        });
        numberedSections[level] = (numberedSections[level] || 0) + 1;
        const text =
          extractText(block.children) || block.children[0].text || "";
        if (text) {
          const id = text.toLowerCase().replace(/\s+/g, "-");
          const prefix = Object.entries(numberedSections)
            .sort(([a], [b]) => parseInt(a) - parseInt(b))
            .map(([, num]) => num)
            .join(".");
          items.push({ id, text: `${prefix}. ${text}`, level });
        }
      }
    });
    setHeadings(items);
    setTocTree(buildTOCTree(items));
  }, [content]);

  // Handle scroll and intersection observer
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveId(entry.target.id);
          }
        });
      },
      { rootMargin: "-20% 0px -35% 0px" }
    );

    headings.forEach(({ id }) => {
      const element = document.getElementById(id);
      if (element) {
        observer.observe(element);
      }
    });

    return () => observer.disconnect();
  }, [headings]);

  const handleClick = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      const header = document.querySelector("header");
      const headerHeight = header ? header.clientHeight : 80; // Fallback to 80px
      const elementPosition = element.getBoundingClientRect().top;
      const offsetPosition =
        elementPosition + window.scrollY - headerHeight - 20; // 20px extra space

      window.scrollTo({
        top: offsetPosition,
        behavior: "smooth",
      });
    }
  };

  if (headings.length === 0) return null;
  // --- Render TOC Items with hierarchy and style ---
  const renderTOCItem = (item: TOCItem) => {
    const { id, text, level, items } = item;
    const hasChildren = items && items.length > 0;
    const isExpanded = expandedItems.has(id);
    // Style for heading levels
    let headingClass = "";
    if (level === 1) {
      headingClass = "font-semibold text-base text-gray-900";
    } else if (level === 2) {
      headingClass = "font-medium text-sm text-gray-700";
    } else {
      headingClass = "font-normal text-sm text-gray-600";
    }
    return (
      <li key={id} className="list-none">
        <div
          className={cn(
            "flex items-center gap-2 py-2 px-2 cursor-pointer hover:text-purple-600 hover:bg-purple-50 rounded-md transition-all duration-200",
            headingClass,
            activeId === id ? "text-purple-600 bg-purple-50 font-semibold" : ""
          )}
          style={{ paddingLeft: `${level * 0.5}rem` }}
        >
          {/* Always render a fixed-width chevron spacer for alignment */}
          {hasChildren ? (
            <ChevronRight
              className={cn(
                "h-4 w-4 transition-transform flex-shrink-0",
                isExpanded && "transform rotate-90"
              )}
              onClick={(e) => {
                e.stopPropagation();
                toggleExpand(id);
              }}
            />
          ) : (
            <span style={{ width: 16, display: "inline-block" }} />
          )}
          <button
            onClick={() => handleClick(id)}
            className="text-left w-full focus:outline-none rounded-sm"
            aria-label={`Navigate to section: ${text}`}
          >
            {text}
          </button>
        </div>
        {hasChildren && isExpanded && (
          <ul className="mt-1">{items.map((child) => renderTOCItem(child))}</ul>
        )}
      </li>
    );
  };

  return (
    <nav className="lg:sticky lg:top-24">
      <div className="bg-white border border-gray-200 rounded-lg p-4 lg:p-6 shadow-sm">
        <h2 className="text-base lg:text-lg font-semibold mb-3 lg:mb-4 text-gray-900 flex items-center gap-2">
          <svg
            className="w-4 h-4 lg:w-5 lg:h-5 text-purple-600"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4 6h16M4 10h16M4 14h16M4 18h16"
            />
          </svg>
          Table of Contents
        </h2>
        <ul className="space-y-1 max-h-64 lg:max-h-96 overflow-y-auto">
          {tocTree.map((item) => renderTOCItem(item))}
        </ul>
      </div>
    </nav>
  );
}
