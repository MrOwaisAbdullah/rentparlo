import { defineField, defineType } from 'sanity'

export default defineType({
  name: 'category',
  title: 'Category',
  type: 'document',
  fields: [
    defineField({
      name: 'title',
      title: 'Title',
      type: 'string',
      validation: Rule => Rule.required(),
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
      type: 'text',
    }),
    defineField({
      name: 'parent',
      title: 'Parent Category',
      type: 'reference',
      to: [{type: 'category'}],
      description: 'Leave blank for top-level categories',
    }),
    defineField({
      name: 'icon',
      title: 'Icon',
      type: 'image',
      options: {
        hotspot: true,
      },
    }),
    defineField({
      name: 'order',
      title: 'Order',
      type: 'number',
      initialValue: 0,
      description: 'Lower number = higher position',
    }),
    defineField({
      name: 'itemCount',
      title: 'Item Count',
      type: 'number',
      initialValue: 0,
      description: 'Number of active listings in this category',
    }),
    defineField({
      name: 'popular',
      title: 'Popular Category',
      type: 'boolean',
      initialValue: false,
      description: 'Mark as popular to show prominently',
    })
  ],
  preview: {
    select: {
      title: 'title',
      parent: 'parent.title',
      media: 'icon',
    },
    prepare(selection) {
      const {parent} = selection
      return {
        ...selection,
        subtitle: parent ? `Parent: ${parent}` : 'Top-level category'
      }
    }
  }
})  