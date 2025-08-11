import { defineCollection, z } from 'astro:content';

const blogCollection = defineCollection({
  type: 'content',
  schema: z.object({
    title: z.string(),
    description: z.string(),
    publishDate: z.date(),
    author: z.string().default('AktivCRO Team'),
    category: z.enum(['CRO', 'Lead Generation', 'A/B Testing', 'Analytics', 'Case Study', 'Tutorial']),
    tags: z.array(z.string()),
    featured: z.boolean().default(false),
    image: z.string().optional(),
    imageAlt: z.string().optional(),
    readTime: z.number().default(5),
    seoTitle: z.string().optional(),
    seoDescription: z.string().optional()
  })
});

export const collections = {
  'blog': blogCollection,
};