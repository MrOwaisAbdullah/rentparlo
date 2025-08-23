import { defineField, defineType } from 'sanity'

export default defineType({
  name: 'review',
  title: 'Review',
  type: 'document',
  fields: [
    defineField({
      name: 'listing',
      title: 'Listing',
      type: 'reference',
      to: [{type: 'listing'}],
      validation: Rule => Rule.required(),
    }),
    defineField({
      name: 'supabaseUserId',
      title: 'Supabase User ID',
      type: 'string',
      description: 'Reference to Supabase user ID (do not edit manually)',
      readOnly: true,
      hidden: true,
    }),
    defineField({
      name: 'rating',
      title: 'Rating',
      type: 'number',
      validation: Rule => Rule.required().min(1).max(5),
      options: {
        list: [1, 2, 3, 4, 5],
        layout: 'radio'
      }
    }),
    defineField({
      name: 'title',
      title: 'Review Title',
      type: 'string',
      validation: Rule => Rule.required().max(100),
    }),
    defineField({
      name: 'comment',
      title: 'Comment',
      type: 'text',
      validation: Rule => Rule.required().min(20),
    }),
    defineField({
      name: 'images',
      title: 'Review Images',
      type: 'array',
      of: [{type: 'image', options: {hotspot: true}}],
      description: 'Optional images to support the review',
    }),
    defineField({
      name: 'status',
      title: 'Status',
      type: 'string',
      options: {
        list: [
          {title: 'Pending', value: 'pending'},
          {title: 'Approved', value: 'approved'},
          {title: 'Rejected', value: 'rejected'},
        ],
      },
      initialValue: 'pending',
      validation: Rule => Rule.required(),
    })
  ],
  preview: {
    select: {
      title: 'title',
      rating: 'rating',
      listing: 'listing.title',
      media: 'listing.images.0',
    },
    prepare(selection) {
      const {rating} = selection
      return {
        ...selection,
        subtitle: rating ? `Rating: ${rating} stars` : 'No rating'
      }
    }
  }
})
  
  