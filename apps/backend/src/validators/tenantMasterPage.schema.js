import { z } from 'zod';

export const masterPageIdParamSchema = z.object({
  id: z.string().uuid('Invalid master page id'),
});

export const upsertMasterPageSchema = z.object({
  id: z.string().uuid().optional(),
  status: z.enum(['DRAFT', 'PUBLISHED', 'ARCHIVED']),
  pageType: z.string().min(2).max(30),
  title: z.string().min(2).max(255),
  slug: z.string().min(1).max(255),
  isHomePage: z.boolean().optional(),
});
