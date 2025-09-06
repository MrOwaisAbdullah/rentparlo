import { client } from '@/sanity/lib/client';
import { Category, Listing } from '@/types';
import { groq } from 'next-sanity';

export async function getCategories(): Promise<Category[]> {
  return client.fetch(
    groq`*[_type == "category"]{
      ...,
      "slug": slug.current
    } | order(order asc)`
  );
}

export async function getCategoryWithListings(slug: string): Promise<{
  category: Category;
  listings: Listing[];
}> {
  const category = await client.fetch(
    groq`*[_type == "category" && slug.current == $slug][0]{
      ...,
      "slug": slug.current
    }`,
    { slug }
  );

  const listings = await client.fetch(
    groq`*[_type == "listing" && references($categoryId) && approved == true]{
      ...,
      "slug": slug.current,
      "mainImage": mainImage.asset->url,
      "owner": owner->{
        ...,
        "slug": slug.current
      }
    }`,
    { categoryId: category._id }
  );

  return { category, listings };
}
