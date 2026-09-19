import { z } from 'zod';

export const submitAnswerSchema = z.object({
  answer: z.string().min(1).max(4000)
});
