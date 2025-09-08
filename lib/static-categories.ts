import { Category } from '@/types'

// Define the 9 main categories with their properties
export const STATIC_CATEGORIES: Category[] = [
  {
    _id: 'camera',
    title: 'Camera',
    slug: 'camera',
    description: 'Professional cameras, lenses, and photography equipment',
    icon: undefined,
    order: 1,
    popular: true,
    itemCount: 0
  },
  {
    _id: 'automobiles',
    title: 'Automobiles',
    slug: 'automobiles',
    description: 'Cars, bikes, and other vehicles for rent',
    icon: undefined,
    order: 2,
    popular: true,
    itemCount: 0
  },
  {
    _id: 'medical',
    title: 'Medical',
    slug: 'medical-equipment',
    description: 'Medical devices and healthcare equipment',
    icon: undefined,
    order: 3,
    popular: true,
    itemCount: 0
  },
  {
    _id: 'construction',
    title: 'Construction',
    slug: 'construction-equipment',
    description: 'Construction tools and equipment',
    icon: undefined,
    order: 4,
    popular: true,
    itemCount: 0
  },
  {
    _id: 'generators',
    title: 'Generators',
    slug: 'generators',
    description: 'Power generators and electrical equipment',
    icon: undefined,
    order: 5,
    popular: true,
    itemCount: 0
  },
  {
    _id: 'wedding-couture',
    title: 'Wedding Couture',
    slug: 'wedding-couture',
    description: 'Wedding dresses, suits, and accessories',
    icon: undefined,
    order: 6,
    popular: true,
    itemCount: 0
  },
  {
    _id: 'events',
    title: 'Events',
    slug: 'events',
    description: 'Event equipment and party supplies',
    icon: undefined,
    order: 7,
    popular: true,
    itemCount: 0
  },
  {
    _id: 'studio',
    title: 'Studio',
    slug: 'studio',
    description: 'Studio equipment and recording gear',
    icon: undefined,
    order: 8,
    popular: true,
    itemCount: 0
  },
  {
    _id: 'advertisements',
    title: 'Advertisements',
    slug: 'advertisements',
    description: 'Advertising materials and signage',
    icon: undefined,
    order: 9,
    popular: false,
    itemCount: 0
  }
]

// Popular categories (all 9)
export const POPULAR_CATEGORIES = STATIC_CATEGORIES.filter(cat => cat.popular)

// Emoji map for fallback icons
export const CATEGORY_EMOJIS: Record<string, string> = {
  'automobiles': '🚗',
  'medical-equipment': '🩺',
  'construction-equipment': '🏗️',
  'generators': '⚡',
  'wedding-couture': '💍',
  'events': '🎉',
  'studio': '🎙️',
  'advertisements': '📢',
  'camera': '📷',
  'medical': '⚕️',
  'default': '📦'
}

// Get category by slug
export function getCategoryBySlug(slug: string): Category | undefined {
  return STATIC_CATEGORIES.find(category => {
    if (typeof category.slug === 'string') {
      return category.slug === slug
    } else if (typeof category.slug === 'object' && category.slug !== null) {
      return category.slug.current === slug
    }
    return false
  })
}

// Get category by ID
export function getCategoryById(id: string): Category | undefined {
  return STATIC_CATEGORIES.find(category => category._id === id)
}

// Get emoji for category
export function getCategoryEmoji(slug: string): string {
  // Try exact match first
  if (slug in CATEGORY_EMOJIS) {
    return CATEGORY_EMOJIS[slug]
  }
  
  // Try partial matches
  if (slug.includes('camera') || slug.includes('photo')) return '📷'
  if (slug.includes('car') || slug.includes('auto')) return '🚗'
  if (slug.includes('medical') || slug.includes('health')) return '🩺'
  if (slug.includes('construct') || slug.includes('build')) return '🏗️'
  if (slug.includes('electric') || slug.includes('power')) return '⚡'
  if (slug.includes('wedding') || slug.includes('bridal')) return '💍'
  if (slug.includes('event') || slug.includes('party')) return '🎉'
  if (slug.includes('studio') || slug.includes('record')) return '🎙️'
  if (slug.includes('advertise') || slug.includes('sign')) return '📢'
  
  // Default fallback
  return CATEGORY_EMOJIS['default']
}