import { client } from '@/sanity/lib/client';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    console.log('--- Starting Category & Listing Debug ---');

    // 1. Fetch all categories with their parent relationships
    const categories: any[] = await client.fetch(`
      *[_type == "category"]{
        _id,
        title,
        "slug": slug.current,
        "parent": parent->{_id, title, "slug": slug.current}
      }
    `);
    console.log(`
--- Found ${categories.length} Categories ---`);
    console.table(categories);

    // 2. Fetch all active listings and group them by category
    const listings: any[] = await client.fetch(`
        *[_type == "listing" && status == 'active']{
            _id,
            title,
            "category": category->{_id, title}
        }
    `);
    console.log(`
--- Found ${listings.length} Active Listings ---`);

    const listingsByCategory: {[key: string]: any[]} = listings.reduce((acc, listing) => {
        const categoryId = listing.category?._id;
        if (categoryId) {
            if (!acc[categoryId]) {
                acc[categoryId] = [];
            }
            acc[categoryId].push(listing);
        }
        return acc;
    }, {});

    // 3. Combine category data with listing counts
    const categoryListingCounts = categories.map(category => ({
      ...category,
      "listingCount": listingsByCategory[category._id]?.length || 0,
    }));

    console.log(`
--- Category Listing Counts ---`);
    console.table(categoryListingCounts);

    // 4. Specifically check for "Electronics" and "Camera"
    const electronicsCategory = categoryListingCounts.find(c => c.title.toLowerCase() === 'electronics');
    const cameraCategory = categoryListingCounts.find(c => c.title.toLowerCase() === 'camera');

    console.log(`
--- Specific Category Checks ---`);
    if (electronicsCategory) {
        console.log('Found "Electronics" category:', electronicsCategory);
    } else {
        console.log('"Electronics" category NOT FOUND.');
    }

    if (cameraCategory) {
        console.log('Found "Camera" category:', cameraCategory);
    } else {
        console.log('"Camera" category NOT FOUND.');
    }

    console.log(`--- Debugging Complete ---`);

    return NextResponse.json({
      message: 'Debug data logged to server console.',
      categories: categoryListingCounts,
    });

  } catch (error) {
    console.error('--- Debugging Error ---', error);
    return NextResponse.json({ error: 'Failed to run debug script.' }, { status: 500 });
  }
}