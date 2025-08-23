import { defineField, defineType } from 'sanity'

export default defineType({
  name: 'banner',
  title: 'Homepage Banner',
  type: 'document',
  fields: [
    defineField({
      name: 'title',
      title: 'Title',
      type: 'string',
      validation: Rule => Rule.required(),
    }),
    defineField({
      name: 'titleUrdu',
      title: 'Title (Urdu)',
      type: 'string',
      description: 'Optional Urdu title',
    }),
    defineField({
      name: 'subtitle',
      title: 'Subtitle',
      type: 'string',
    }),
    defineField({
      name: 'subtitleUrdu',
      title: 'Subtitle (Urdu)',
      type: 'string',
    }),
    defineField({
      name: 'image',
      title: 'Image',
      type: 'image',
      options: {
        hotspot: true,
      },
      validation: Rule => Rule.required(),
    }),
    defineField({
      name: 'mobileImage',
      title: 'Mobile Image',
      type: 'image',
      options: {
        hotspot: true,
      },
      description: 'Optional optimized image for mobile devices',
    }),
    defineField({
      name: 'link',
      title: 'Link',
      type: 'string',
      description: 'URL to link to (e.g., /category/electronics)',
    }),
    defineField({
      name: 'order',
      title: 'Order',
      type: 'number',
      initialValue: 0,
      description: 'Lower number = earlier position',
    }),
    defineField({
      name: 'active',
      title: 'Active',
      type: 'boolean',
      initialValue: true,
    })
  ],
  orderings: [
    {
      title: 'Order',
      name: 'orderAsc',
      by: [{field: 'order', direction: 'asc'}]
    }
  ]
})
  