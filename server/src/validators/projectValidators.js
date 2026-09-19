import { z } from 'zod';

export const createProjectSchema = z.object({
  name: z.string().min(1).max(120),
  description: z.string().max(1000).optional().default(''),
  learningGoal: z.string().max(500).optional().default('')
});

export const updateProjectSchema = createProjectSchema.partial();
