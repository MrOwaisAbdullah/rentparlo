import createImageUrlBuilder from '@sanity/image-url'
import { SanityImageSource } from "@sanity/image-url/lib/types/types";

import { dataset, projectId } from '../env'

// https://www.sanity.io/docs/image-url
const builder = createImageUrlBuilder({ projectId, dataset })

export const urlFor = (source: SanityImageSource) => {
  return builder.image(source)
}

/**
 * Get optimized image URL with specified dimensions
 * @param image - The Sanity image object
 * @param dimensions - Object with width and height properties
 * @param fallbackUrl - Fallback URL if image is not available
 * @returns Optimized image URL or fallback URL
 */
export const getOptimizedImageUrl = (
  image: any,
  dimensions: { width: number; height: number },
  fallbackUrl?: string
): string => {
  if (!image?.asset?._ref && !image?.asset?.url) {
    return fallbackUrl || '';
  }

  try {
    return urlFor(image)
      .width(dimensions.width)
      .height(dimensions.height)
      .url();
  } catch (error) {
    console.warn('Error optimizing image URL:', error);
    return fallbackUrl || image.asset.url || '';
  }
};

/**
 * Get Sanity image URL
 * @param image - The Sanity image object
 * @param fallbackUrl - Fallback URL if image is not available
 * @returns Image URL or fallback URL
 */
export const getSanityImageUrl = (
  image: any,
  fallbackUrl?: string
): string => {
  // Check if image is null, undefined, or not an object
  if (!image || typeof image !== 'object') {
    return fallbackUrl || '';
  }

  // Check if asset property exists and has either _ref or url
  if (!image.asset || (!image.asset._ref && !image.asset.url)) {
    return fallbackUrl || '';
  }

  try {
    return urlFor(image).url();
  } catch (error) {
    console.warn('Error getting Sanity image URL:', error);
    return fallbackUrl || (image.asset.url || '');
  }
};