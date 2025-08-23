import { defineField, defineType } from 'sanity'

export default defineType({
  name: 'blog',
  title: 'Blog Post',
  type: 'document',
  groups: [
    {
      name: 'content',
      title: 'Content',
    },
    {
      name: 'seo',
      title: 'SEO & Social',
    },
    {
      name: 'settings',
      title: 'Settings',
    }
  ],
  fields: [
    defineField({
      name: 'title',
      title: 'Title',
      type: 'string',
      group: 'content',
      validation: Rule => Rule.required().max(80).warning('Titles should be under 80 characters for better SEO'),
    }),
    defineField({
      name: 'titleUrdu',
      title: 'Title (Urdu)',
      type: 'string',
      group: 'content',
      description: 'Optional Urdu title',
    }),
    defineField({
      name: 'slug',
      title: 'Slug',
      type: 'slug',
      group: 'content',
      options: {
        source: 'title',
        maxLength: 96,
      },
      validation: Rule => Rule.required(),
    }),
    defineField({
      name: 'excerpt',
      title: 'Excerpt',
      type: 'text',
      group: 'content',
      rows: 3,
      validation: Rule => Rule.required().max(160).warning('Excerpts should be under 160 characters for better SEO'),
    }),
    defineField({
      name: 'excerptUrdu',
      title: 'Excerpt (Urdu)',
      type: 'text',
      group: 'content',
      rows: 3,
      description: 'Optional Urdu excerpt',
    }),
    defineField({
      name: 'body',
      title: 'Body',
      type: 'array',
      group: 'content',
      of: [
        {
          type: 'block',
          styles: [
            {title: 'Normal', value: 'normal'},
            {title: 'H1', value: 'h1'},
            {title: 'H2', value: 'h2'},
            {title: 'H3', value: 'h3'},
            {title: 'H4', value: 'h4'},
            {title: 'Quote', value: 'blockquote'},
          ],
          lists: [{title: 'Bullet', value: 'bullet'}, {title: 'Numbered', value: 'number'}],
          marks: {
            decorators: [
              {title: 'Strong', value: 'strong'},
              {title: 'Emphasis', value: 'em'},
              {title: 'Code', value: 'code'},
            ],
            annotations: [
              {
                title: 'URL',
                name: 'link',
                type: 'object',
                fields: [
                  {
                    title: 'URL',
                    name: 'href',
                    type: 'url',
                  },
                  {
                    title: 'Open in new tab',
                    name: 'blank',
                    type: 'boolean',
                  },
                ],
              },
            ],
          },
        },
        {
          type: 'image',
          options: {hotspot: true},
          fields: [
            {
              name: 'alt',
              type: 'string',
              title: 'Alternative Text',
              description: 'Important for SEO and accessibility.',
              validation: Rule => Rule.required(),
            },
            {
              name: 'caption',
              type: 'string',
              title: 'Caption',
            },
          ],
        },
        {
          type: 'code',
          name: 'codeBlock',
          title: 'Code Block',
        },
      ],
      validation: Rule => Rule.required().min(1),
    }),
    defineField({
      name: 'bodyUrdu',
      title: 'Body (Urdu)',
      type: 'array',
      group: 'content',
      of: [{type: 'block'}],
      description: 'Optional Urdu content',
    }),
    defineField({
      name: 'mainImage',
      title: 'Main image',
      type: 'image',
      group: 'content',
      options: {
        hotspot: true,
      },
      fields: [
        {
          name: 'alt',
          type: 'string',
          title: 'Alternative Text',
          description: 'Important for SEO and accessibility.',
          validation: Rule => Rule.required(),
        },
        {
          name: 'caption',
          type: 'string',
          title: 'Caption',
        },
      ],
      validation: Rule => Rule.required(),
    }),
    defineField({
      name: 'categories',
      title: 'Categories',
      type: 'array',
      group: 'content',
      of: [{type: 'reference', to: {type: 'category'}}],
      validation: Rule => Rule.max(3).warning('Consider using fewer categories for better organization'),
    }),
    defineField({
      name: 'tags',
      title: 'Tags',
      type: 'array',
      group: 'content',
      of: [{type: 'string'}],
      options: {
        layout: 'tags',
      },
      validation: Rule => Rule.max(10),
    }),
    defineField({
      name: 'author',
      title: 'Author',
      type: 'string',
      group: 'content',
      initialValue: 'RentParLo Team',
    }),
    defineField({
      name: 'readingTime',
      title: 'Reading Time (minutes)',
      type: 'number',
      group: 'content',
      description: 'Estimated reading time in minutes. Leave empty to auto-calculate.',
    }),
    // SEO & Social Fields
    defineField({
      name: 'seo',
      title: 'SEO Settings',
      type: 'object',
      group: 'seo',
      fields: [
        {
          name: 'metaTitle',
          type: 'string',
          title: 'Meta Title',
          description: 'Title for search engines (50-60 characters)',
          validation: Rule => Rule.max(60).warning('Meta titles should be under 60 characters'),
        },
        {
          name: 'metaDescription',
          type: 'text',
          title: 'Meta Description',
          rows: 3,
          description: 'Description for search engines (150-160 characters)',
          validation: Rule => Rule.max(160).warning('Meta descriptions should be under 160 characters'),
        },
        {
          name: 'focusKeyword',
          type: 'string',
          title: 'Focus Keyword',
          description: 'Primary keyword for this post',
        },
        {
          name: 'socialImage',
          type: 'image',
          title: 'Social Share Image',
          description: 'Image for social media sharing (1200x630px recommended)',
          options: {
            hotspot: true,
          },
          fields: [
            {
              name: 'alt',
              type: 'string',
              title: 'Alternative Text',
            },
          ],
        },
        {
          name: 'noIndex',
          type: 'boolean',
          title: 'No Index',
          description: 'Prevent search engines from indexing this post',
          initialValue: false,
        },
      ],
    }),
    defineField({
      name: 'relatedPosts',
      title: 'Related Posts',
      type: 'array',
      group: 'settings',
      of: [{type: 'reference', to: {type: 'blog'}}],
      validation: Rule => Rule.max(3).warning('Consider limiting to 3 related posts for better UX'),
    }),
    defineField({
      name: 'publishedAt',
      title: 'Published at',
      type: 'datetime',
      group: 'settings',
      initialValue: () => new Date().toISOString(),
    }),
    defineField({
      name: 'featured',
      title: 'Featured',
      type: 'boolean',
      group: 'settings',
      description: 'Show this post prominently on the blog homepage',
      initialValue: false,
    }),
    defineField({
      name: 'status',
      title: 'Status',
      type: 'string',
      group: 'settings',
      options: {
        list: [
          {title: 'Draft', value: 'draft'},
          {title: 'Published', value: 'published'},
          {title: 'Archived', value: 'archived'},
        ],
        layout: 'radio',
      },
      initialValue: 'draft',
    }),
    defineField({
      name: 'language',
      title: 'Language',
      type: 'string',
      group: 'settings',
      options: {
        list: [
          {title: 'English', value: 'en'},
          {title: 'Urdu', value: 'ur'},
          {title: 'Both', value: 'both'},
        ],
      },
      initialValue: 'en',
    }),
  ],
  orderings: [
    {
      title: 'Published Date (Newest First)',
      name: 'publishedAtDesc',
      by: [{field: 'publishedAt', direction: 'desc'}],
    },
    {
      title: 'Published Date (Oldest First)',
      name: 'publishedAtAsc',
      by: [{field: 'publishedAt', direction: 'asc'}],
    },
    {
      title: 'Title A-Z',
      name: 'titleAsc',
      by: [{field: 'title', direction: 'asc'}],
    },
  ],
  preview: {
    select: {
      title: 'title',
      author: 'author',
      media: 'mainImage',
      status: 'status',
      publishedAt: 'publishedAt',
    },
    prepare(selection) {
      const {author, status, publishedAt} = selection
      const formattedDate = publishedAt ? new Date(publishedAt).toLocaleDateString() : 'No date'
      
      return {
        ...selection,
        subtitle: `${status?.toUpperCase() || 'DRAFT'} | ${author || 'No author'} | ${formattedDate}`,
      }
    }
  }
})
  