import { defineField, defineType } from 'sanity'

export default defineType({
  name: 'listing',
  title: 'Listing',
  type: 'document',
  fields: [
    defineField({
      name: 'title',
      title: 'Title',
      type: 'string',
      validation: Rule => Rule.required().min(10).max(100),
    }),
    defineField({
      name: 'slug',
      title: 'Slug',
      type: 'slug',
      options: {
        source: 'title',
        maxLength: 96,
      },
      validation: Rule => Rule.required(),
    }),
    defineField({
      name: 'description',
      title: 'Description',
      type: 'array',
      of: [{type: 'block'}],
      validation: Rule => Rule.required().min(50),
    }),
    defineField({
      name: 'pricePerHour',
      title: 'Hourly Price (PKR)',
      type: 'number',
      description: 'Optional hourly rate for short-term rentals',
    }),
    defineField({
      name: 'price',
      title: 'Daily Price (PKR)',
      type: 'number',
      validation: Rule => Rule.required().min(0),
    }),
    defineField({
      name: 'priceWeekly',
      title: 'Weekly Price (PKR)',
      type: 'number',
      description: 'Optional discounted weekly price',
    }),
    defineField({
      name: 'priceMonthly',
      title: 'Monthly Price (PKR)',
      type: 'number',
      description: 'Optional discounted monthly price',
    }),
    defineField({
      name: 'category',
      title: 'Category',
      type: 'reference',
      to: [{type: 'category'}],
      validation: Rule => Rule.required(),
    }),
    {
        name: 'images',
        title: 'Product Images',
        type: 'array',
        of: [{type: 'image', options: {hotspot: true}}],
        validation: Rule => Rule.required().min(1).max(10),
      },
    defineField({
      name: 'location',
      title: 'Location',
      type: 'object',
      fields: [
        defineField({
          name: 'city',
          title: 'City',
          type: 'string',
        }),
        defineField({
          name: 'area',
          title: 'Area/Locality',
          type: 'string',
        })
      ],
      validation: Rule => Rule.required(),
    }),
    defineField({
      name: 'condition',
      title: 'Item Condition',
      type: 'string',
      options: {
        list: [
          {title: 'New', value: 'new'},
          {title: 'Like New', value: 'like-new'},
          {title: 'Good', value: 'good'},
          {title: 'Fair', value: 'fair'},
        ],
      },
      validation: Rule => Rule.required(),
    }),
    defineField({ 
      name: 'tags',         
      type: 'array',  
      of: [{ type: 'string' }] 
    }),
    defineField({
      name: 'availability',
      title: 'Availability',
      type: 'object',
      fields: [
        defineField({
          name: 'isAvailable',
          title: 'Currently Available',
          type: 'boolean',
          initialValue: true,
        })
      ]
    }),
    // promotion flags
    defineField({ name: 'isFeatured', type: 'boolean', initialValue: false }),
    defineField({ name: 'isVerified', type: 'boolean', initialValue: false }),
    defineField({ name: 'published',  type: 'boolean', initialValue: false }),
  
    // seo
    defineField({
      name: 'seo',
      type: 'object',
      fields: [
        defineField({ name: 'metaTitle',       type: 'string' }),
        defineField({ name: 'metaDescription', type: 'text'  }),
      ],
    }),
  
    defineField({
      name: 'specifications',
      title: 'Specifications',
      type: 'array',
      of: [{type: 'object', fields: [
        defineField({name: 'key', type: 'string', title: 'Feature'}),
        defineField({name: 'value', type: 'string', title: 'Value'})
      ]}],
      description: 'Key specifications of the item (e.g., Brand, Model, Capacity)',
    }),
    defineField({
      name: 'rentalRules',
      title: 'Rental Rules',
      type: 'array',
      of: [{type: 'string'}],
      description: 'Rules for renting this item (e.g., Minimum rental period, Security deposit)',
    }),
    defineField({
      name: 'status',
      title: 'Status',
      type: 'string',
      options: {
        list: [
          {title: 'Active', value: 'active'},
          {title: 'Pending Verification', value: 'pending'},
          {title: 'Suspended', value: 'suspended'},
          {title: 'Expired', value: 'expired'},
        ],
      },
      initialValue: 'pending',
      validation: Rule => Rule.required(),
    }),
    defineField({
      name: 'supabaseId',
      title: 'Supabase User ID',
      type: 'string',
      description: 'Reference to Supabase user ID (do not edit manually)',
      readOnly: true,
      hidden: true,
    })
  ],
  preview: {
    select: {
      title: 'title',
      subtitle: 'category.title',
      media: 'images.0',
    },
  }
})
  