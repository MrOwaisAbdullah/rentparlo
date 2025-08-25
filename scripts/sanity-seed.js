/**
 * =====================================================
 * RentParlo.pk Sanity CMS Seeding Script v2
 * =====================================================
 * This script populates Sanity with sample data for development and testing
 * Features:
 * - Proper _key values for all array items
 * - Real image uploads from public directory
 * - Improved error handling and validation
 * 
 * ⚠️  IMPORTANT: This script requires that the sample users already exist 
 * in the Supabase auth.users table. Run the Supabase seeding script first:
 * node scripts/supabase-seed-fixed.js
 * 
 * Run this using Sanity CLI: npx sanity exec scripts/sanity-seed.js --with-user-token
 */

import { createClient } from '@sanity/client'
import { 
  uploadImageToSanity, 
  uploadListingImages, 
  getImagePathsForCategory, 
  uploadBannerImages,
  generateKey,
  addKeysToArrayItems 
} from './image-upload-helpers.js'
import { CATEGORIES } from './categories-simple.js'

// Use a client with explicit token configuration
const client = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID,
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET,
  apiVersion: '2025-08-14',
  useCdn: false,
  token: process.env.SANITY_API_TOKEN
})

// Pakistani cities and areas for location data
const PAKISTANI_CITIES = [
  'Karachi',
  'Lahore', 
  'Islamabad',
  'Rawalpindi',
  'Faisalabad',
  'Multan',
  'Peshawar',
  'Quetta',
  'Sialkot',
  'Gujranwala'
]

const CITY_AREAS = {
  'Karachi': ['DHA', 'Clifton', 'Gulshan', 'North Nazimabad', 'Defence', 'Saddar'],
  'Lahore': ['Gulberg', 'Model Town', 'Johar Town', 'DHA', 'Cantt', 'Garden Town'],
  'Islamabad': ['F-7', 'F-8', 'F-10', 'F-11', 'Blue Area', 'G-9'],
  'Rawalpindi': ['Saddar', 'Commercial Market', 'Cantt', 'Committee Chowk'],
  'Faisalabad': ['Civil Lines', 'Peoples Colony', 'Susan Road', 'Kohinoor City'],
  'Multan': ['Cantt', 'Gulgasht', 'Shah Rukn-e-Alam'],
  'Peshawar': ['University Town', 'Hayatabad', 'Saddar'],
  'Quetta': ['Cantt', 'Satellite Town', 'Jinnah Town'],
  'Sialkot': ['Cantt', 'Paris Road', 'Kashmir Road'],
  'Gujranwala': ['Cantt', 'Civil Lines', 'Satellite Town']
}

// Sample Supabase User IDs (matching the seed script)
// NOTE: These IDs must exist in the Supabase auth.users table before running this script
const SELLER_IDS = [
  '22222222-2222-2222-2222-222222222222', // Ahmed Photography
  '33333333-3333-3333-3333-333333333333', // Sara Electronics  
  '44444444-4444-4444-4444-444444444444', // Ali Cars
  '55555555-5555-5555-5555-555555555555', // Fatima Medical
  '66666666-6666-6666-6666-666666666666'  // Hassan Tools
]

/**
 * Generate a random element from an array
 */
function getRandomElement(array) {
  return array[Math.floor(Math.random() * array.length)]
}

/**
 * Generate random number of images for a listing (1-3 images)
 */
function getRandomImages(categoryImages) {
  const numImages = Math.floor(Math.random() * 3) + 1 // 1-3 images
  const shuffled = [...categoryImages].sort(() => 0.5 - Math.random())
  return shuffled.slice(0, Math.min(numImages, categoryImages.length))
}

/**
 * Generate a proper location object
 */
function generateLocation() {
  const city = getRandomElement(PAKISTANI_CITIES)
  const areas = CITY_AREAS[city] || ['City Center']
  const area = getRandomElement(areas)
  
  return {
    city: city,
    area: area
  }
}

/**
 * Generate a random price based on category
 */
function generatePrice(categoryTitle) {
  const priceRanges = {
    'Camera': { min: 2000, max: 15000 },
    'Automobiles': { min: 5000, max: 25000 },
    'Medical': { min: 200, max: 2000 },
    'Construction': { min: 500, max: 5000 },
    'Generators': { min: 1000, max: 8000 },
    'Wedding Couture': { min: 3000, max: 20000 },
    'Events': { min: 1000, max: 15000 },
    'Studio': { min: 2000, max: 12000 },
    'Advertisements': { min: 500, max: 5000 }
  }
  
  const range = priceRanges[categoryTitle] || { min: 500, max: 3000 }
  return Math.floor(Math.random() * (range.max - range.min + 1)) + range.min
}

/**
 * Check if a document with the given slug already exists
 */
async function slugExists(type, slug) {
  try {
    const query = `*[_type == "${type}" && slug.current == "${slug}"]`
    const existing = await client.fetch(query)
    return existing.length > 0
  } catch (error) {
    console.error(`Error checking slug existence:`, error.message)
    return false
  }
}

/**
 * Generate a unique slug by appending a timestamp if needed
 */
async function generateUniqueSlug(type, baseSlug) {
  // First check if the base slug is available
  if (!(await slugExists(type, baseSlug))) {
    return baseSlug
  }
  
  // If not available, append timestamp to make it unique
  const timestamp = Date.now()
  const uniqueSlug = `${baseSlug}-${timestamp}`
  
  // Double-check that this unique slug doesn't exist
  if (!(await slugExists(type, uniqueSlug))) {
    return uniqueSlug
  }
  
  // If somehow still not unique, add a random string
  const randomSuffix = Math.random().toString(36).substring(2, 8)
  return `${baseSlug}-${timestamp}-${randomSuffix}`
}

/**
 * Create sample categories
 */
async function createCategories() {
  console.log('Creating categories...')
  
  // Use categories from lib/categories.ts
  const categoryData = CATEGORIES.map((category) => ({
    _type: 'category',
    title: category.title,
    slug: { current: category.slug },
    description: category.description,
    order: category.order,
    popular: category.popular || false
  }));

  const createdCategories = []
  for (const category of categoryData) {
    try {
      // Check if category already exists
      const existingQuery = `*[_type == "category" && title == "${category.title}"]`
      const existingCategories = await client.fetch(existingQuery)
      
      if (existingCategories.length > 0) {
        console.log(`⚠️  Category "${category.title}" already exists, using existing`)
        createdCategories.push(existingCategories[0])
        continue
      }
      
      const result = await client.create(category)
      createdCategories.push(result)
      console.log(`✓ Created category: ${category.title}`)
    } catch (error) {
      console.error(`✗ Failed to create category ${category.title}:`, error.message)
    }
  }
  
  return createdCategories
}

/**
 * Create sample listings with real images
 */
async function createListings(categories) {
  console.log('Creating listings with real images...')
  
  const listings = [
    // Camera
    {
      _type: 'listing',
      title: 'Canon EOS R5 Professional Camera with 24-70mm Lens',
      slugBase: 'canon-eos-r5-professional-camera',
      description: 'Professional grade camera perfect for photography and videography projects. High resolution sensor with excellent low light performance. Includes 24-70mm f/2.8 lens, battery charger, and carrying case. Perfect for weddings, events, and professional shoots. Equipment is well-maintained and comes with a full warranty.',
      price: 8000,
      pricePerHour: 500,
      priceType: 'daily',
      priceWeekly: 50000,
      category: { _type: 'reference', _ref: categories.find(c => c.title === 'Camera')?._id },
      location: generateLocation(),
      condition: 'like-new',
      availability: { isAvailable: true },
      specifications: addKeysToArrayItems([
        { key: 'Brand', value: 'Canon' },
        { key: 'Resolution', value: '45MP' },
        { key: 'Video', value: '8K RAW' },
        { key: 'Lens Mount', value: 'RF Mount' },
        { key: 'ISO Range', value: '100-51200' }
      ], 'spec'),
      rentalRules: [
        'Valid CNIC required',
        'Security deposit refundable',
        'Minimum rental period: 1 day',
        'Professional handling required'
      ],
      status: 'active',
      supabaseId: getRandomElement(SELLER_IDS),
      isFeatured: true,
      published: true,
      categoryName: 'Camera'
    },
    
    // Automobiles
    {
      _type: 'listing',
      title: 'BMW 3 Series 2022 - Luxury Sedan for Events',
      slugBase: 'bmw-3-series-luxury-sedan',
      description: 'Luxury sedan perfect for special events and occasions. Comfortable interior with premium features including leather seats, automatic climate control, and advanced safety features. Well-maintained vehicle with full service history. Perfect for weddings, corporate events, and special occasions.',
      price: 15000,
      priceWeekly: 90000,
      priceMonthly: 350000,
      category: { _type: 'reference', _ref: categories.find(c => c.title === 'Automobiles')?._id },
      location: generateLocation(),
      condition: 'like-new',
      availability: { isAvailable: true },
      specifications: addKeysToArrayItems([
        { key: 'Engine', value: '2.0L Turbo' },
        { key: 'Fuel Type', value: 'Petrol' },
        { key: 'Transmission', value: 'Automatic' },
        { key: 'Seating', value: '5 Persons' },
        { key: 'Year', value: '2022' }
      ], 'spec'),
      rentalRules: [
        'Valid CNIC and driving license required',
        'Security deposit refundable',
        'Minimum rental period: 1 day',
        'Fuel policy: Full to full',
        'Age limit: 25+ years'
      ],
      status: 'active',
      supabaseId: getRandomElement(SELLER_IDS),
      isFeatured: true,
      published: true,
      categoryName: 'Automobiles'
    },

    // Medical
    {
      _type: 'listing',
      title: 'Omron Blood Pressure Monitor - Automatic Cuff',
      slugBase: 'omron-blood-pressure-monitor',
      description: 'Accurate and easy-to-use blood pressure monitor with automatic cuff inflation. Perfect for home health monitoring with memory for multiple users. Well-maintained medical device with all accessories included. Comes with user manual and warranty.',
      price: 500,
      pricePerHour: 50,
      priceType: 'daily',
      category: { _type: 'reference', _ref: categories.find(c => c.title === 'Medical')?._id },
      location: generateLocation(),
      condition: 'new',
      availability: { isAvailable: true },
      specifications: addKeysToArrayItems([
        { key: 'Brand', value: 'Omron' },
        { key: 'Type', value: 'Automatic' },
        { key: 'Cuff Size', value: 'Universal' },
        { key: 'Memory', value: '2-user, 14 readings each' },
        { key: 'Power', value: 'Battery/AC Adapter' }
      ], 'spec'),
      rentalRules: [
        'Valid CNIC required',
        'Security deposit refundable',
        'Minimum rental period: 1 day',
        'Proper sanitization required',
        'Medical clearance recommended'
      ],
      status: 'active',
      supabaseId: getRandomElement(SELLER_IDS),
      isFeatured: false,
      published: true,
      categoryName: 'Medical'
    }
  ]

  // Generate more listings for each category with real images
  const additionalListings = []
  for (const category of categories) {
    for (let i = 0; i < 3; i++) {
      const price = generatePrice(category.title)
      
      additionalListings.push({
        _type: 'listing',
        title: `${category.title} Item ${i + 1} - Premium Quality`,
        slugBase: `${category.slug.current}-item-${i + 1}`,
        description: `High-quality ${category.title.toLowerCase()} available for rent. Perfect for professional and personal use with excellent condition guarantee. Well-maintained equipment with all accessories included. Comes with user manual and warranty. Ideal for ${category.title.toLowerCase()} enthusiasts and professionals.`,
        price: price,
        pricePerHour: Math.floor(price * 0.06),
        priceType: 'daily',
        category: { _type: 'reference', _ref: category._id },
        location: generateLocation(),
        condition: getRandomElement(['new', 'like-new', 'good']),
        availability: { isAvailable: true },
        specifications: addKeysToArrayItems([
          { key: 'Brand', value: 'Premium Brand' },
          { key: 'Condition', value: 'Excellent' },
          { key: 'Year', value: '2022-2023' }
        ], 'spec'),
        rentalRules: [
          'Valid CNIC required',
          'Security deposit refundable',
          'Minimum rental period: 1 day'
        ],
        status: 'active',
        supabaseId: getRandomElement(SELLER_IDS),
        isFeatured: Math.random() > 0.7,
        published: true,
        categoryName: category.title
      })
    }
  }

  const allListings = [...listings, ...additionalListings]
  const createdListings = []
  
  // Process each listing with images
  for (const listing of allListings) {
    try {
      // Generate unique slug
      const uniqueSlug = await generateUniqueSlug('listing', listing.slugBase)
      listing.slug = { current: uniqueSlug }
      delete listing.slugBase
      
      // Check if listing with this slug already exists
      if (await slugExists('listing', uniqueSlug)) {
        console.log(`⚠️  Listing with slug "${uniqueSlug}" already exists, skipping`)
        continue
      }
      
      console.log(`Processing listing: ${listing.title}`)
      
      // Upload images for this listing
      const categoryImages = getImagePathsForCategory(listing.categoryName)
      if (categoryImages.length > 0) {
        const selectedImages = getRandomImages(categoryImages)
        console.log(`  Uploading ${selectedImages.length} images...`)
        const uploadedImages = await uploadListingImages(selectedImages)
        listing.images = uploadedImages
      } else {
        console.log(`  No images found for category: ${listing.categoryName}`)
        listing.images = []
      }
      
      // Remove the categoryName helper property
      delete listing.categoryName
      
      const result = await client.create(listing)
      createdListings.push(result)
      console.log(`✓ Created listing: ${listing.title}`)
    } catch (error) {
      console.error(`✗ Failed to create listing ${listing.title}:`, error.message)
    }
  }
  
  return createdListings
}

/**
 * Create sample blog posts with proper keys
 */
async function createBlogPosts(categories) {
  console.log('Creating blog posts...')
  
  // Upload sample images for blog posts
  console.log('Uploading blog images...')
  const blogImages = await uploadBannerImages()
  
  const blogPosts = [
    {
      _type: 'blog',
      title: 'The Ultimate Guide to Renting Camera Equipment in Pakistan',
      titleUrdu: 'پاکستان میں کیمرہ کا سامان کرائے پر لینے کا مکمل گائیڈ',
      slugBase: 'ultimate-guide-camera-rental-pakistan',
      excerpt: 'Everything you need to know about renting professional camera equipment for your photography and videography projects in Pakistan.',
      excerptUrdu: 'پاکستان میں فوٹوگرافی اور ویڈیوگرافی کے پروجیکٹس کے لیے پروفیشنل کیمرہ کا سامان کرائے پر لینے کے بارے میں آپ کو جاننے کی ضرورت ہے۔',
      mainImage: blogImages[0] || null,
      body: [
        {
          _type: 'block',
          _key: generateKey('blog_block'),
          children: [{ 
            _type: 'span', 
            _key: generateKey('blog_span'),
            text: 'Renting camera equipment has become an increasingly popular option for photographers and videographers in Pakistan. Whether you\'re a professional looking to try new gear or a hobbyist wanting to upgrade for a special project, rental services offer flexibility and cost savings.' 
          }]
        }
      ],
      categories: [{ _type: 'reference', _ref: categories.find(c => c.title === 'Camera')?._id }],
      tags: ['photography', 'camera rental', 'equipment', 'pakistan'],
      author: 'RentParlo Team',
      readingTime: 8,
      publishedAt: new Date().toISOString(),
      featured: true,
      status: 'published',
      language: 'both'
    },
    
    {
      _type: 'blog',
      title: 'Car Rental vs Buying: What Makes Sense in Pakistani Cities',
      slugBase: 'car-rental-vs-buying-pakistani-cities',
      excerpt: 'A comprehensive comparison of car rental versus buying for urban transportation in major Pakistani cities.',
      mainImage: blogImages[1] || null,
      body: [
        {
          _type: 'block',
          _key: generateKey('blog_block'),
          children: [{ 
            _type: 'span', 
            _key: generateKey('blog_span'),
            text: 'With rising fuel costs and parking challenges in Pakistani cities, many are reconsidering car ownership. This guide explores when renting makes more sense than buying.' 
          }]
        }
      ],
      categories: [{ _type: 'reference', _ref: categories.find(c => c.title === 'Automobiles')?._id }],
      tags: ['car rental', 'transportation', 'urban mobility', 'pakistan'],
      author: 'Transportation Expert',
      readingTime: 6,
      publishedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
      featured: false,
      status: 'published',
      language: 'en'
    },

    {
      _type: 'blog',
      title: '5 Essential Medical Devices Every Home Should Have Access To',
      slugBase: 'essential-medical-devices-home-access',
      excerpt: 'Learn about important medical devices that can be rented for home healthcare monitoring and emergency situations.',
      mainImage: blogImages[2] || null,
      body: [
        {
          _type: 'block',
          _key: generateKey('blog_block'),
          children: [{ 
            _type: 'span', 
            _key: generateKey('blog_span'),
            text: 'Home healthcare is becoming increasingly important, especially for elderly family members. These essential medical devices can be rented when needed without the high upfront costs.' 
          }]
        }
      ],
      categories: [{ _type: 'reference', _ref: categories.find(c => c.title === 'Medical')?._id }],
      tags: ['medical equipment', 'healthcare', 'home monitoring', 'rental'],
      author: 'Healthcare Specialist',
      readingTime: 5,
      publishedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
      featured: true,
      status: 'published',
      language: 'en'
    }
  ]

  const createdBlogPosts = []
  for (const post of blogPosts) {
    try {
      // Generate unique slug
      const uniqueSlug = await generateUniqueSlug('blog', post.slugBase)
      post.slug = { current: uniqueSlug }
      delete post.slugBase
      
      // Check if blog post with this slug already exists
      if (await slugExists('blog', uniqueSlug)) {
        console.log(`⚠️  Blog post with slug "${uniqueSlug}" already exists, skipping`)
        continue
      }
      
      const result = await client.create(post)
      createdBlogPosts.push(result)
      console.log(`✓ Created blog post: ${post.title}`)
    } catch (error) {
      console.error(`✗ Failed to create blog post ${post.title}:`, error.message)
    }
  }
  
  return createdBlogPosts
}

/**
 * Create sample banners with real images
 */
async function createBanners() {
  console.log('Creating banners with real images...')
  
  // Upload banner images first
  console.log('Uploading banner images...')
  const bannerImages = await uploadBannerImages()
  
  const banners = [
    {
      _type: 'banner',
      title: 'Rent Premium Camera Equipment',
      titleUrdu: 'پریمیم کیمرہ کا سامان کرائے پر لیں',
      subtitle: 'Professional photography gear at affordable rates',
      subtitleUrdu: 'سستی قیمتوں پر پروفیشنل فوٹوگرافی کا سامان',
      image: bannerImages[0] || null,
      link: '/category/camera-photography',
      order: 1,
      active: true
    },
    
    {
      _type: 'banner',
      title: 'Luxury Cars for Special Occasions',
      titleUrdu: 'خصوصی مواقع کے لیے لگژری کاریں',
      subtitle: 'Make your events memorable with premium vehicles',
      subtitleUrdu: 'پریمیم گاڑیوں کے ساتھ اپنے ایونٹس کو یادگار بنائیں',
      image: bannerImages[1] || null,
      link: '/category/automobiles',
      order: 2,
      active: true
    },
    
    {
      _type: 'banner',
      title: 'Medical Equipment When You Need It',
      titleUrdu: 'طبی آلات جب آپ کو ضرورت ہو',
      subtitle: 'Home healthcare devices available for rent',
      subtitleUrdu: 'گھریلو صحت کی دیکھ بھال کے آلات کرائے پر دستیاب',
      image: bannerImages[2] || null,
      link: '/category/medical-equipment', 
      order: 3,
      active: false
    },
    
    {
      _type: 'banner',
      title: 'Find Everything You Need to Rent',
      titleUrdu: 'کرائے پر لینے کے لیے آپ کو جو کچھ چاہیے تلاش کریں',
      subtitle: 'Your trusted marketplace for rentals in Pakistan',
      subtitleUrdu: 'پاکستان میں کرائے کے لیے آپ کا بھروسہ مند بازار',
      image: bannerImages[3] || null,
      link: '/search',
      order: 4,
      active: true
    }
  ]

  const createdBanners = []
  for (const banner of banners) {
    try {
      // Check if banner with this title already exists
      const existingQuery = `*[_type == "banner" && title == "${banner.title}"]`
      const existingBanners = await client.fetch(existingQuery)
      
      if (existingBanners.length > 0) {
        console.log(`⚠️  Banner "${banner.title}" already exists, using existing`)
        createdBanners.push(existingBanners[0])
        continue
      }
      
      const result = await client.create(banner)
      createdBanners.push(result)
      console.log(`✓ Created banner: ${banner.title}`)
    } catch (error) {
      console.error(`✗ Failed to create banner ${banner.title}:`, error.message)
    }
  }
  
  return createdBanners
}

/**
 * Create sample reviews with proper keys
 */
async function createReviews(listings) {
  console.log('Creating reviews...')
  
  if (listings.length < 3) {
    console.log('Not enough listings to create reviews')
    return []
  }
  
  const reviews = [
    {
      _type: 'review',
      listing: { _type: 'reference', _ref: listings[0]._id },
      supabaseUserId: '77777777-7777-7777-7777-777777777777',
      rating: 5,
      title: 'Excellent Camera Quality',
      comment: 'The Canon R5 was in perfect condition and the owner was very helpful. Great experience overall. Will definitely rent again for my next project.',
      status: 'approved'
    },
    
    {
      _type: 'review',
      listing: { _type: 'reference', _ref: listings[1]._id },
      supabaseUserId: '88888888-8888-8888-8888-888888888888',
      rating: 4,
      title: 'Great Car for Wedding',
      comment: 'BMW was perfect for our wedding day. Clean, comfortable, and the rental process was smooth. Only minor issue was pickup timing.',
      status: 'approved'
    },
    
    {
      _type: 'review',
      listing: { _type: 'reference', _ref: listings[2]._id },
      supabaseUserId: '99999999-9999-9999-9999-999999999999',
      rating: 5,
      title: 'Reliable Medical Equipment',
      comment: 'Blood pressure monitor worked perfectly for monitoring my elderly father. Very accurate readings and easy to use.',
      status: 'approved'
    }
  ]

  const createdReviews = []
  for (const review of reviews) {
    try {
      const result = await client.create(review)
      createdReviews.push(result)
      console.log(`✓ Created review for listing: ${review.listing._ref}`)
    } catch (error) {
      console.error(`✗ Failed to create review:`, error.message)
    }
  }
  
  return createdReviews
}

/**
 * Main seeding function
 */
async function seedSanity() {
  console.log('🌱 Starting Sanity seeding process...\n')
  
  try {
    // Create categories first
    const categories = await createCategories()
    console.log(`\n✓ Created ${categories.length} categories`)
    
    // Create listings
    const listings = await createListings(categories)
    console.log(`\n✓ Created ${listings.length} listings`)
    
    // Create blog posts
    const blogPosts = await createBlogPosts(categories)
    console.log(`\n✓ Created ${blogPosts.length} blog posts`)
    
    // Create banners
    const banners = await createBanners()
    console.log(`\n✓ Created ${banners.length} banners`)
    
    // Create reviews
    const reviews = await createReviews(listings.slice(0, 3))
    console.log(`\n✓ Created ${reviews.length} reviews`)
    
    console.log('\n🎉 Sanity seeding completed successfully!')
    console.log('\nSummary:')
    console.log(`- Categories: ${categories.length}`)
    console.log(`- Listings: ${listings.length}`)
    console.log(`- Blog Posts: ${blogPosts.length}`)
    console.log(`- Banners: ${banners.length}`)
    console.log(`- Reviews: ${reviews.length}`)
    
    console.log('\n💡 Remember to run the development server to see your data:')
    console.log('   npm run dev')
    
  } catch (error) {
    console.error('❌ Seeding failed:', error)
    
    if (error.message && error.message.includes('foreign key')) {
      console.log('\n⚠️  Foreign key constraint error detected!')
      console.log('💡 This usually means the required users don\'t exist in Supabase auth.users')
      console.log('💡 Run the Supabase seeding script first:')
      console.log('   node scripts/supabase-seed-fixed.js')
    }
    
    process.exit(1)
  }
}

// Execute seeding
seedSanity()