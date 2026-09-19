import { z } from 'zod';

export const createSpaceSchema = z.object({
  name: z.string().min(1).max(120),
  description: z.string().max(1000).optional().default(''),
  color: z.string().max(20).optional(),
  icon: z.string().max(40).optional()
});

export const updateSpaceSchema = createSpaceSchema.partial();
