import { z } from 'zod';

export const createSectionSchema = z.object({
  sectionType: z.string().min(2),
  sectionData: z.any(),
});

export const updateSectionSchema = z.object({
  sectionData: z.any(),
});

export const moveSectionSchema = z.object({
  newOrder: z.number().min(1),
});
