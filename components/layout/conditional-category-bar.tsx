"use client";

import { usePathname } from 'next/navigation';
import { CategoryBarWrapper } from './category-bar-wrapper';

export function ConditionalCategoryBar() {
  const pathname = usePathname();
  const show = !pathname.startsWith('/dashboard');

  return <CategoryBarWrapper show={show} />;
}
