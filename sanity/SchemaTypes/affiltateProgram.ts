import { defineField, defineType } from 'sanity'

export default defineType({
  name: 'affiliateProgram',
  title: 'Affiliate Program',
  type: 'document',
  fields: [
    defineField({
      name: 'title',
      title: 'Program Title',
      type: 'string',
      validation: Rule => Rule.required(),
    }),
    defineField({
      name: 'description',
      title: 'Description',
      type: 'text',
    }),
    defineField({
      name: 'supabaseId',
      title: 'Supabase Program ID',
      type: 'string',
      description: 'Reference to Supabase affiliate_programs.id',
      readOnly: true,
      hidden: true,
    }),
    defineField({
      name: 'bannerImage',
      title: 'Banner Image',
      type: 'image',
      options: { hotspot: true },
    }),
    defineField({
      name: 'featured',
      title: 'Featured Program',
      type: 'boolean',
      initialValue: false,
    }),
    defineField({
      name: 'order',
      title: 'Display Order',
      type: 'number',
      initialValue: 0,
    })
  ]
})
  