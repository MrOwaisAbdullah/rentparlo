// sanity/SchemaTypes/index.ts

import { type SchemaTypeDefinition } from 'sanity'
import adBanner from './adBanner'
import affiltateProgram from './affiltateProgram'
import banner from './banner'
import blog from './blog'
import category from './category'
import review from './review'
import listing from './listing'
import { verificationDocument } from './verificationDocument'

export const schema: { types: SchemaTypeDefinition[] } = {
  types: [adBanner, affiltateProgram, banner, blog, category, review, listing, verificationDocument],
}