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
          {title: 'Dashboard Top', value: 'dashboard-top'},
          {title: 'Dashboard Sidebar', value: 'dashboard-sidebar'},
          {title: 'Category Page Top', value: 'category-top'},
          {title: 'Category Page Sidebar', value: 'category-sidebar'},
          {title: 'Category Page Sidebar (Category Specific)', value: 'category-sidebar-specific'},
          {title: 'Search Results Top', value: 'search-top'},
          {title: 'Search Results Sidebar', value: 'search-sidebar'},
          {title: 'Listing Page Top', value: 'listing-top'},
          {title: 'Listing Page Sidebar', value: 'listing-sidebar'},
          {title: 'User Profile Top', value: 'profile-top'},
          {title: 'User Profile Sidebar', value: 'profile-sidebar'},
          {title: 'Blog Page Top', value: 'blog-top'},
          {title: 'Blog Page Sidebar', value: 'blog-sidebar'},
          {title: 'Content Page Top', value: 'content-top'},
          {title: 'Content Page Sidebar', value: 'content-sidebar'},
          {title: 'Mobile Banner', value: 'mobile-banner'},
          {title: 'Mobile Specific', value: 'mobile-specific'},
          {title: 'Popup Banner', value: 'popup-banner'},
          {title: 'Seller Profile Banner', value: 'seller-profile'}
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
          {title: 'Leaderboard (1200x250)', value: 'leaderboard'},
          {title: 'Large Banner (1400x400)', value: 'large-banner'},
          {title: 'Medium Rectangle (300x250)', value: 'medium-rectangle'},
          {title: 'Large Rectangle (336x280)', value: 'large-rectangle'},
          {title: 'Half Page (300x600)', value: 'half-page'},
          {title: 'Mobile Banner (320x50)', value: 'mobile-banner'},
          {title: 'Popup (600x400)', value: 'popup'},
          {title: 'Square (250x250)', value: 'square'},
          {title: 'Vertical Rectangle (300x600)', value: 'vertical-rectangle'},
          {title: 'Skyscraper (160x600)', value: 'skyscraper'}
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
  