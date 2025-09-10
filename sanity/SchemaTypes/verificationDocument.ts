import {defineField, defineType} from 'sanity'

export const verificationDocument = defineType({
  name: 'verificationDocument',
  title: 'Verification Document',
  type: 'document',
  icon: () => '📄',
  description: 'Seller verification documents including CNIC and business licenses',
  fields: [
    defineField({
      name: 'sellerId',
      title: 'Seller ID',
      type: 'string',
      description: 'Supabase user ID of the seller',
      validation: rule => rule.required(),
      readOnly: true
    }),
    defineField({
      name: 'documentType',
      title: 'Document Type',
      type: 'string',
      options: {
        list: [
          {title: 'CNIC Front', value: 'cnic_front'},
          {title: 'CNIC Back', value: 'cnic_back'},
          {title: 'Business License', value: 'business_license'},
          {title: 'Bank Statement', value: 'bank_statement'}
        ],
        layout: 'radio'
      },
      validation: rule => rule.required()
    }),
    defineField({
      name: 'fileName',
      title: 'File Name',
      type: 'string',
      description: 'Original file name when uploaded',
      validation: rule => rule.required()
    }),
    defineField({
      name: 'fileAsset',
      title: 'Document File',
      type: 'image',
      description: 'The actual document image or PDF',
      options: {
        hotspot: false,
        metadata: ['exif', 'location', 'palette']
      },
      validation: rule => rule.required()
    }),
    defineField({
      name: 'fileSize',
      title: 'File Size',
      type: 'number',
      description: 'File size in bytes',
      validation: rule => rule.required().min(0)
    }),
    defineField({
      name: 'mimeType',
      title: 'MIME Type',
      type: 'string',
      description: 'File MIME type',
      options: {
        list: [
          'image/jpeg',
          'image/png',
          'image/webp',
          'application/pdf'
        ]
      },
      validation: rule => rule.required()
    }),
    defineField({
      name: 'uploadedAt',
      title: 'Uploaded At',
      type: 'datetime',
      description: 'When the document was uploaded',
      validation: rule => rule.required(),
      options: {
        dateFormat: 'YYYY-MM-DD',
        timeFormat: 'HH:mm'
      }
    }),
    defineField({
      name: 'verificationStatus',
      title: 'Verification Status',
      type: 'string',
      options: {
        list: [
          {title: 'Pending Review', value: 'pending'},
          {title: 'Under Review', value: 'under_review'},
          {title: 'Approved', value: 'approved'},
          {title: 'Rejected', value: 'rejected'},
          {title: 'Requires Resubmission', value: 'resubmit_required'}
        ],
        layout: 'radio'
      },
      initialValue: 'pending',
      validation: rule => rule.required()
    }),
    defineField({
      name: 'rejectionReason',
      title: 'Rejection Reason',
      type: 'text',
      description: 'Reason for rejection if status is rejected',
      rows: 3,
      hidden: ({document}) => document?.verificationStatus !== 'rejected'
    }),
    defineField({
      name: 'verifiedBy',
      title: 'Verified By',
      type: 'string',
      description: 'Admin user ID who verified this document',
      hidden: ({document}) => !['approved', 'rejected'].includes(document?.verificationStatus as string)
    }),
    defineField({
      name: 'verifiedAt',
      title: 'Verified At',
      type: 'datetime',
      description: 'When the document was verified',
      hidden: ({document}) => !['approved', 'rejected'].includes(document?.verificationStatus as string),
      options: {
        dateFormat: 'YYYY-MM-DD',
        timeFormat: 'HH:mm'
      }
    }),
    defineField({
      name: 'metadata',
      title: 'Metadata',
      type: 'object',
      description: 'Additional metadata about the document',
      fields: [
        {
          name: 'originalFileName',
          title: 'Original File Name',
          type: 'string'
        },
        {
          name: 'uploadedByUser',
          title: 'Uploaded By User ID',
          type: 'string'
        },
        {
          name: 'documentCategory',
          title: 'Document Category',
          type: 'string',
          options: {
            list: [
              'seller_verification',
              'listing_verification',
              'dispute_resolution'
            ]
          },
          initialValue: 'seller_verification'
        },
        {
          name: 'ipAddress',
          title: 'Upload IP Address',
          type: 'string'
        },
        {
          name: 'userAgent',
          title: 'User Agent',
          type: 'string'
        },
        {
          name: 'verificationNotes',
          title: 'Verification Notes',
          type: 'array',
          of: [{
            type: 'object',
            fields: [
              {name: 'note', type: 'text', title: 'Note'},
              {name: 'addedBy', type: 'string', title: 'Added By'},
              {name: 'addedAt', type: 'datetime', title: 'Added At'},
              {name: 'visibility', type: 'string', title: 'Visibility', options: {
                list: ['internal', 'seller_visible']
              }}
            ]
          }]
        }
      ],
      options: {
        collapsible: true,
        collapsed: true
      }
    }),
    defineField({
      name: 'expiryDate',
      title: 'Document Expiry Date',
      type: 'date',
      description: 'When this document expires (for CNICs, licenses, etc.)',
      options: {
        dateFormat: 'YYYY-MM-DD'
      }
    }),
    defineField({
      name: 'autoExtracted',
      title: 'Auto-Extracted Data',
      type: 'object',
      description: 'Data automatically extracted from the document',
      fields: [
        {
          name: 'cnicNumber',
          title: 'CNIC Number',
          type: 'string',
          description: 'Extracted CNIC number'
        },
        {
          name: 'name',
          title: 'Name',
          type: 'string',
          description: 'Extracted name from document'
        },
        {
          name: 'fatherName',
          title: 'Father Name',
          type: 'string',
          description: 'Extracted father name'
        },
        {
          name: 'dateOfBirth',
          title: 'Date of Birth',
          type: 'date',
          description: 'Extracted date of birth'
        },
        {
          name: 'issueDate',
          title: 'Issue Date',
          type: 'date',
          description: 'Document issue date'
        },
        {
          name: 'expiryDate',
          title: 'Expiry Date',
          type: 'date',
          description: 'Document expiry date'
        },
        {
          name: 'confidence',
          title: 'Extraction Confidence',
          type: 'number',
          description: 'Confidence score of the extraction (0-1)',
          validation: rule => rule.min(0).max(1)
        }
      ],
      options: {
        collapsible: true,
        collapsed: true
      }
    })
  ],
  preview: {
    select: {
      title: 'fileName',
      subtitle: 'documentType',
      status: 'verificationStatus',
      sellerId: 'sellerId',
      media: 'fileAsset'
    },
    prepare({title, subtitle, status, sellerId, media}) {
      const statusEmoji = {
        pending: '⏳',
        under_review: '👀',
        approved: '✅',
        rejected: '❌',
        resubmit_required: '🔄'
      }
      
      const typeLabel = {
        cnic_front: 'CNIC Front',
        cnic_back: 'CNIC Back',
        business_license: 'Business License',
        bank_statement: 'Bank Statement'
      }

      return {
        title: `${statusEmoji[status] || '📄'} ${title}`,
        subtitle: `${typeLabel[subtitle] || subtitle} • Seller: ${sellerId?.slice(-8)}`,
        media: media || '📄'
      }
    }
  },
  orderings: [
    {
      title: 'Upload Date (Newest)',
      name: 'uploadedAtDesc',
      by: [
        {field: 'uploadedAt', direction: 'desc'}
      ]
    },
    {
      title: 'Upload Date (Oldest)',
      name: 'uploadedAtAsc', 
      by: [
        {field: 'uploadedAt', direction: 'asc'}
      ]
    },
    {
      title: 'Status',
      name: 'status',
      by: [
        {field: 'verificationStatus', direction: 'asc'},
        {field: 'uploadedAt', direction: 'desc'}
      ]
    },
    {
      title: 'Document Type',
      name: 'type',
      by: [
        {field: 'documentType', direction: 'asc'},
        {field: 'uploadedAt', direction: 'desc'}
      ]
    }
  ]
})