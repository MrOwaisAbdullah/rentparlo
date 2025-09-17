// lib/sanity-actions.ts
'use server';

import { sanityWriteClient } from '@/lib/sanity';

interface ImageAsset {
    _type: 'image';
    asset: {
        _type: 'reference';
        _ref: string;
    };
}

interface CreateReviewData {
  listingId: string;
  rating: number;
  title: string;
  comment: string;
  supabaseUserId: string;
  images?: ImageAsset[];
}

export async function createReview(data: CreateReviewData) {
  try {
    // Add _key to each image for Sanity
    const imagesWithKeys = data.images?.map((image, index) => ({
      ...image,
      _key: `image-${Date.now()}-${index}`
    })) || [];

    const newReview = await sanityWriteClient.create({
      _type: 'review',
      listing: {
        _type: 'reference',
        _ref: data.listingId,
      },
      supabaseUserId: data.supabaseUserId,
      rating: data.rating,
      title: data.title,
      comment: data.comment,
      images: imagesWithKeys,
      status: 'approved', // Changed from 'pending' to 'approved' for immediate display
    });
    return newReview;
  } catch (error) {
    console.error('Error creating review in Sanity:', error);
    throw new Error('Failed to create review in Sanity');
  }
}
