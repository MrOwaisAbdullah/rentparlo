import { client } from './sanity';
import { BlogPost, BlogPostSummary, BlogCategory, BlogFilters, BlogPagination } from '@/types';
import { groq } from 'next-sanity';

const blogPostSummaryFields = `
  _id,
  title,
  titleUrdu,
  slug,
  excerpt,
  excerptUrdu,
  mainImage {
    asset->{
      url,
      metadata
    },
    alt,
    caption
  },
  "categories": categories[]->{
    _id,
    title,
    "slug": slug.current
  },
  tags,
  author,
  readingTime,
  publishedAt,
  featured,
  language
`;

const blogPostFields = `
  ${blogPostSummaryFields},
  body,
  bodyUrdu,
  "relatedPosts": relatedPosts[]->{
    ${blogPostSummaryFields}
  }
`;

export async function getRecentPosts(limit: number = 3): Promise<BlogPostSummary[]> {
  try {
    const query = groq`*[_type == "blog" && status == "published"] | order(publishedAt desc) [0...${limit}] {
      ${blogPostSummaryFields}
    }`;
    return await client.fetch(query);
  } catch (error) {
    console.error('Error fetching recent blog posts:', error);
    return [];
  }
}

export async function getAllPosts(
  page: number = 1,
  limit: number = 12
): Promise<{ posts: BlogPostSummary[]; total: number }> {
  try {
    const offset = (page - 1) * limit;
    const [posts, total] = await Promise.all([
      client.fetch<BlogPostSummary[]>(groq`
        *[_type == "blog" && status == "published"] | order(publishedAt desc) [${offset}...${offset + limit}] {
          ${blogPostSummaryFields}
        }
      `),
      client.fetch<number>(groq`count(*[_type == "blog" && status == "published"])`)
    ]);
    return { posts, total };
  } catch (error) {
    console.error('Error fetching all blog posts:', error);
    return { posts: [], total: 0 };
  }
}

export async function getPostBySlug(slug: string): Promise<BlogPost | null> {
  try {
    const query = groq`*[_type == "blog" && slug.current == $slug][0] {
      ${blogPostFields}
    }`;
    return await client.fetch(query, { slug });
  } catch (error) {
    console.error('Error fetching post by slug:', error);
    return null;
  }
}

export async function getAllCategories(): Promise<BlogCategory[]> {
  try {
    const query = groq`*[_type == "category" && defined(slug.current)] | order(title asc) {
      _id,
      title,
      slug,
      description,
      "postCount": count(*[_type == "blog" && references(^._id)])
    }`;
    return await client.fetch(query);
  } catch (error) {
    console.error('Error fetching blog categories:', error);
    return [];
  }
}

export async function getAllTags(): Promise<string[]> {
  try {
    const query = groq`*[_type == "blog" && defined(tags)].tags | order() | unique()`;
    return await client.fetch(query);
  } catch (error) {
    console.error('Error fetching blog tags:', error);
    return [];
  }
}

export async function getFeaturedPosts(limit: number = 2): Promise<BlogPostSummary[]> {
  try {
    const query = groq`*[_type == "blog" && status == "published" && featured == true] | order(publishedAt desc) [0...${limit}] {
      ${blogPostSummaryFields}
    }`;
    return await client.fetch(query);
  } catch (error) {
    console.error('Error fetching featured blog posts:', error);
    return [];
  }
}


/**
 * Search blog posts
 */
export async function searchBlogPosts(
  searchQuery: string,
  page: number = 1,
  limit: number = 12
): Promise<{ posts: BlogPostSummary[]; total: number }> {
  try {
    const offset = (page - 1) * limit;
    const query = searchQuery.toLowerCase();

    const [posts, total] = await Promise.all([
      client.fetch<BlogPostSummary[]>(groq`
        *[_type == "blog" && status == "published" && (
          title match "${query}*" ||
          excerpt match "${query}*" ||
          "${query}" in tags
        )] | order(publishedAt desc) [${offset}...${offset + limit}] {
          ${blogPostSummaryFields}
        }
      `),
      client.fetch<number>(groq`
        count(*[_type == "blog" && status == "published" && (
          title match "${query}*" ||
          excerpt match "${query}*" ||
          "${query}" in tags
        )])
      `)
    ]);

    return { posts, total };
  } catch (error) {
    console.error('Error searching blog posts:', error);
    return { posts: [], total: 0 };
  }
}

/**
 * Get blog post archive by month/year
 */
export async function getBlogArchive(): Promise<Array<{ month: string; year: number; count: number }>> {
  try {
    const query = groq`
      *[_type == "blog" && status == "published"] {
        "month": dateTime(publishedAt).month,
        "year": dateTime(publishedAt).year
      } | order(year desc, month desc) | {
        "month": month,
        "year": year,
        "count": count(*)
      }
    `;

    return await client.fetch(query);
  } catch (error) {
    console.error('Error fetching blog archive:', error);
    return [];
  }
}

/**
 * Utility function to calculate reading time
 */
export function calculateReadingTime(content: string): number {
  const wordsPerMinute = 200;
  const wordCount = content.split(' ').length;
  return Math.ceil(wordCount / wordsPerMinute);
}

/**
 * Generate blog post sitemap data
 */
export async function getBlogSitemapData(): Promise<Array<{ slug: string; lastModified: string }>> {
  try {
    const query = groq`
      *[_type == "blog" && status == "published"] {
        "slug": slug.current,
        "lastModified": _updatedAt
      }
    `;

    return await client.fetch(query);
  } catch (error) {
    console.error('Error fetching blog sitemap data:', error);
    return [];
  }
}
