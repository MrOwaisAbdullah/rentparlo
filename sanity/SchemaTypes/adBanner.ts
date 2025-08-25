import { defineField, defineType } from 'sanity'

export default defineType({
  name: 'adBanner',
  title: 'Advertisement Banner',
  type: 'document',
  fields: [
    defineField({
      name: 'title',
      title: 'Banner Title',
      type: 'string',
      validation: Rule => Rule.required(),
    }),
    defineField({
      name: 'placement',
      title: 'Placement Location',
      type: 'string',
      options: {
        list: [
          {title: 'Homepage Top', value: 'homepage-top'},
          {title: 'Homepage Middle', value: 'homepage-middle'},
          {title: 'Homepage Bottom', value: 'homepage-bottom'},
          {title: 'Category Page Sidebar', value: 'category-sidebar'},
          {title: 'Search Results Top', value: 'search-top'},
          {title: 'Listing Page Sidebar', value: 'listing-sidebar'},
          {title: 'Mobile Banner', value: 'mobile-banner'}
        ]
      },
      validation: Rule => Rule.required(),
    }),
    defineField({
      name: 'size',
      title: 'Banner Size',
      type: 'string',
      options: {
        list: [
          {title: 'Leaderboard (728x90)', value: 'leaderboard'},
          {title: 'Medium Rectangle (300x250)', value: 'medium-rectangle'},
          {title: 'Large Rectangle (336x280)', value: 'large-rectangle'},
          {title: 'Half Page (300x600)', value: 'half-page'},
          {title: 'Mobile Banner (320x50)', value: 'mobile-banner'}
        ]
      },
      validation: Rule => Rule.required(),
    }),
    defineField({
      name: 'image',
      title: 'Banner Image',
      type: 'image',
      options: { hotspot: true },
      validation: Rule => Rule.required(),
    }),
    defineField({
      name: 'mobileImage',
      title: 'Mobile Image (Optional)',
      type: 'image',
      options: { hotspot: true },
      description: 'Use if you need a different image for mobile devices'
    }),
    defineField({
      name: 'targetUrl',
      title: 'Target URL',
      type: 'url',
      validation: Rule => Rule.required(),
    }),
    defineField({
      name: 'targetLocation',
      title: 'Target Location (Optional)',
      type: 'string',
      description: 'Specific location targeting (e.g., "Karachi", "Lahore")'
    }),
    defineField({
      name: 'targetCategory',
      title: 'Target Category (Optional)',
      type: 'reference',
      to: [{type: 'category'}],
      description: 'Only show for this category'
    }),
    defineField({
      name: 'targetUserType',
      title: 'Target User Type',
      type: 'string',
      options: {
        list: [
          {title: 'All Users', value: 'all'},
          {title: 'Sellers Only', value: 'sellers'},
          {title: 'New Users Only', value: 'new-users'}
        ]
      },
      initialValue: 'all'
    }),
    defineField({
      name: 'startDate',
      title: 'Start Date',
      type: 'datetime',
      initialValue: () => new Date().toISOString(),
    }),
    defineField({
      name: 'endDate',
      title: 'End Date',
      type: 'datetime',
    }),
    defineField({
      name: 'isActive',
      title: 'Is Active',
      type: 'boolean',
      initialValue: true,
    }),
    defineField({
      name: 'displayOrder',
      title: 'Display Order',
      type: 'number',
      initialValue: 0,
      description: 'Lower number = higher priority'
    })
  ],
  preview: {
    select: {
      title: 'title',
      placement: 'placement',
      size: 'size',
      media: 'image'
    },
    prepare(selection) {
      const {placement, size} = selection
      return {
        ...selection,
        subtitle: `${placement} • ${size}`
      }
    }
  },
  orderings: [
    {
      title: 'Display Order',
      name: 'orderAsc',
      by: [{field: 'displayOrder', direction: 'asc'}]
    }
  ]
})
  