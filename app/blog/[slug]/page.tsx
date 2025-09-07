import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { BlogPostContent } from '@/components/blog/blog-post-content';
import { BlogPost, BlogPostSummary } from '@/types';
import { getPostBySlug, getRecentPosts } from '@/lib/blog';

interface BlogPostPageProps {
  params: Promise<{
    slug: string;
  }>;
}

export async function generateMetadata({ params }: BlogPostPageProps): Promise<Metadata> {
  const { slug } = await params;
  const post = await getPostBySlug(slug);

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
      canonical: `/blog/${slug}`
    }
  };
}

export default async function BlogPostPage({ params }: BlogPostPageProps) {
  const { slug } = await params;
  const post = await getPostBySlug(slug);

  if (!post) {
    notFound();
  }

  // Get recent posts as related posts
  const relatedPosts = await getRecentPosts(3);

  // Filter out the current post from related posts
  const filteredRelatedPosts = Array.isArray(relatedPosts) 
    ? relatedPosts.filter(relatedPost => relatedPost._id !== post._id)
    : [];

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
      '@id': `https://rentparlo.pk/blog/${slug}`
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
          relatedPosts={filteredRelatedPosts}
        />
      </div>
    </>
  );
}

// Generate static params for all blog posts
export async function generateStaticParams() {
  // In a real implementation, we would fetch all blog post slugs from Sanity
  // For now, we'll return an empty array to use dynamic rendering
  return [];
}