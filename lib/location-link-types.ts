/**
 * =====================================================
 * RentParlo.pk Location Link Types
 * =====================================================
 * Types for category-based location links
 */

export interface LocationLink {
  id: string;
  label: string;
  description: string;
  query: string;
  city: string;
  area?: string;
}

export interface CategoryLocationLink {
  category: string;
  links: LocationLink[];
}