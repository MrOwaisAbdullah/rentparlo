import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { BlogPostContent } from '@/components/blog/blog-post-content';
import { BlogPost, BlogPostSummary } from '@/types';

interface BlogPostPageProps {
  params: Promise<{
    slug: string;
  }>;
}

// Mock function to fetch blog post - replace with actual data fetching
async function getBlogPost(slug: string): Promise<BlogPost | null> {
  // TODO: Implement actual data fetching from Sanity
  const mockPost: BlogPost = {
    _id: '1',
    _type: 'blog',
    _createdAt: '2024-01-15T08:00:00Z',
    _updatedAt: '2024-01-15T10:00:00Z',
    title: 'Complete Guide to Renting Electronics in Pakistan',
    slug: { current: slug },
    excerpt: 'Everything you need to know about renting electronics in Pakistan, from smartphones to laptops and gaming equipment.',
    body: [
      {
        _type: 'block',
        _key: '1',
        style: 'normal',
        children: [
          {
            _type: 'span',
            _key: '1-1',
            text: 'The electronics rental market in Pakistan has experienced tremendous growth in recent years. With the increasing demand for the latest technology and the high cost of purchasing new devices, more people are turning to rental services for their electronic needs.',
            marks: []
          }
        ]
      },
      {
        _type: 'block',
        _key: '2',
        style: 'h2',
        children: [
          {
            _type: 'span',
            _key: '2-1',
            text: 'Why Rent Electronics?',
            marks: []
          }
        ]
      },
      {
        _type: 'block',
        _key: '3',
        style: 'normal',
        children: [
          {
            _type: 'span',
            _key: '3-1',
            text: 'Renting electronics offers several advantages over purchasing, especially in a market like Pakistan where technology evolves rapidly and prices can be prohibitive for many consumers.',
            marks: []
          }
        ]
      }
    ],
    mainImage: {
      asset: { 
        url: '/api/placeholder/1200/630',
        metadata: { lqip: 'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAhEAACAQMDBQAAAAAAAAAAAAABAgMABAUGIWGRkqGx0f/EABUBAQEAAAAAAAAAAAAAAAAAAAMF/8QAGhEAAgIDAAAAAAAAAAAAAAAAAAECEgMRkf/aAAwDAQACEQMRAD8AltJagyeH0AthI5xdrLcNM91BF5pX2HaH9bcfaSXWGaRmknyJckliyjqTzSZX7jxDJdHmEFWBBBBBHY9iD7hNvLm9A=' },
      },
      alt: 'Electronics rental guide illustration',
      caption: 'Modern electronics available for rent in Pakistan'
    },
    categories: [{ _ref: 'electronics', _type: 'reference' }],
    tags: ['electronics', 'rental tips', 'technology', 'pakistan'],
    author: 'RentParLo Team',
    readingTime: 8,
    seo: {
      metaTitle: 'Complete Guide to Renting Electronics in Pakistan | RentParLo',
      metaDescription: 'Learn everything about renting electronics in Pakistan. From smartphones to laptops, discover the best practices, tips, and trusted rental services.',
      focusKeyword: 'electronics rental Pakistan',
      socialImage: {
        asset: { url: '/api/placeholder/1200/630' },
        alt: 'Electronics rental guide'
      }
    },
    relatedPosts: [
      { _ref: '2', _type: 'reference' },
      { _ref: '3', _type: 'reference' }
    ],
    publishedAt: '2024-01-15T10:00:00Z',
    featured: true,
    status: 'published',
    language: 'en'
  };

  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 100));
  
  return slug === 'complete-guide-renting-electronics-pakistan' ? mockPost : null;
}

// Mock function to fetch related posts
async function getRelatedPosts(postId: string): Promise<BlogPostSummary[]> {
  const mockRelatedPosts: BlogPostSummary[] = [
    {
      _id: '2',
      title: 'Top 10 Most Rented Items in Karachi',
      slug: { current: 'top-10-most-rented-items-karachi' },
      excerpt: 'Discover which items are in highest demand in Karachi\'s rental market.',
      mainImage: {
        asset: { url: '/api/placeholder/400/300' },
        alt: 'Popular rental items in Karachi'
      },
      categories: [{ _id: '2', title: 'Market Insights', slug: 'market-insights' }],
      tags: ['karachi', 'trends', 'popular items'],
      author: 'Sarah Ahmed',
      readingTime: 5,
      publishedAt: '2024-01-10T14:30:00Z',
      featured: false,
      language: 'en'
    },
    {
      _id: '3',
      title: 'How to Safely Rent Electronics Online',
      slug: { current: 'safely-rent-electronics-online' },
      excerpt: 'Essential safety tips for renting electronics through online platforms.',
      mainImage: {
        asset: { url: '/api/placeholder/400/300' },
        alt: 'Safe online electronics rental'
      },
      categories: [{ _id: '1', title: 'Electronics', slug: 'electronics' }],
      tags: ['safety', 'online rental', 'electronics'],
      author: 'Ahmed Khan',
      readingTime: 7,
      publishedAt: '2024-01-08T16:00:00Z',
      featured: false,
      language: 'en'
    }
  ];

  return mockRelatedPosts;
}

export async function generateMetadata({ params }: BlogPostPageProps): Promise<Metadata> {
  // Await params before accessing properties
  const resolvedParams = await params;
  const post = await getBlogPost(resolvedParams.slug);

  if (!post) {
    return {
      title: 'Post Not Found | RentParLo.pk',
      description: 'The requested blog post could not be found.'
    };
  }

  const title = post.seo?.metaTitle || post.title;
  const description = post.seo?.metaDescription || post.excerpt;
  const socialImage = post.seo?.socialImage?.asset?.url || post.mainImage?.asset?.url || "/placeholder.svg";

  return {
    title: `${title} | RentParLo.pk`,
    description,
    keywords: post.tags?.join(', '),
    authors: [{ name: post.author }],
    openGraph: {
      title,
      description,
      type: 'article',
      publishedTime: post.publishedAt,
      authors: [post.author],
      images: [
        {
          url: socialImage,
          width: 1200,
          height: 630,
          alt: post.seo?.socialImage?.alt || post.mainImage?.alt || "Blog image"
        }
      ]
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [socialImage]
    },
    alternates: {
      canonical: `/blog/${resolvedParams.slug}`
    }
  };
}

export default async function BlogPostPage({ params }: BlogPostPageProps) {
  // Await params before accessing properties
  const resolvedParams = await params;
  const post = await getBlogPost(resolvedParams.slug);

  if (!post) {
    notFound();
  }

  const relatedPosts = await getRelatedPosts(post._id);

  // Generate JSON-LD structured data
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    headline: post.title,
    description: post.excerpt,
    image: post.mainImage?.asset?.url || "/placeholder.svg",
    author: {
      '@type': 'Person',
      name: post.author
    },
    publisher: {
      '@type': 'Organization',
      name: 'RentParLo.pk',
      logo: {
        '@type': 'ImageObject',
        url: '/logo.png'
      }
    },
    datePublished: post.publishedAt,
    dateModified: post._updatedAt,
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': `https://rentparlo.pk/blog/${resolvedParams.slug}`
    }
  };

  return (
    <>
      {/* JSON-LD Structured Data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <div className="container mx-auto px-4 py-8">
        <BlogPostContent 
          post={post} 
          relatedPosts={relatedPosts}
        />
      </div>
    </>
  );
}

// Generate static params for known blog posts
export async function generateStaticParams() {
  // TODO: Fetch all blog post slugs from Sanity
  const slugs = [
    'complete-guide-renting-electronics-pakistan',
    'top-10-most-rented-items-karachi',
    'safely-rent-electronics-online'
  ];

  return slugs.map((slug) => ({
    slug
  }));
}