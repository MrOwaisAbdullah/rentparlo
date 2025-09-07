import { NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';
import { createReview } from '@/lib/sanity-actions';
import { sanityWriteClient } from '@/lib/sanity';

export async function POST(request: Request) {
  try {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ message: 'Authentication required' }, { status: 401 });
    }

    const formData = await request.formData();
    const rating = Number(formData.get('rating'));
    const title = formData.get('title') as string;
    const comment = formData.get('comment') as string;
    const listingId = formData.get('listingId') as string;
    const images = formData.getAll('images') as File[];

    if (!rating || !title || !comment || !listingId) {
        return NextResponse.json({ message: 'Missing required fields' }, { status: 400 });
    }

    let imageAssets = [];
    if (images.length > 0) {
        const uploadPromises = images
            .filter(image => image.size > 0)
            .map(image => sanityWriteClient.assets.upload('image', image));
        imageAssets = await Promise.all(uploadPromises);
    }

    const newReview = await createReview({
      listingId,
      rating,
      title,
      comment,
      supabaseUserId: user.id,
      images: imageAssets.map(asset => ({
        _type: 'image',
        asset: { _type: 'reference', _ref: asset._id },
      })),
    });

    if (!newReview) {
      return NextResponse.json({ message: 'Failed to create review' }, { status: 500 });
    }

    return NextResponse.json({ message: 'Review submitted successfully', review: newReview }, { status: 201 });

  } catch (error) {
    console.error('Error submitting review:', error);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}
