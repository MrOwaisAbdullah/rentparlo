"use client";

import { usePathname } from 'next/navigation';
import { CategoryBarWrapper } from './category-bar-wrapper';

export function ConditionalCategoryBar() {
  const pathname = usePathname();
  
  // Hide category bar on dashboard pages and welcome page
  const show = !pathname.startsWith('/dashboard') && !pathname.startsWith('/auth');

  return <CategoryBarWrapper show={show} />;
}
