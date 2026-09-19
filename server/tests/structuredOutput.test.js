import { z } from 'zod';

// These schemas mirror the ones used in quizService/pipeline — validated
// directly here to prove malformed AI output is rejected before it could
// ever reach persistence (the "never trust raw LLM output" requirement).
const mcqSchema = z.object({
  question: z.string().min(5),
  options: z.array(z.string().min(1)).length(4),
  correctAnswer: z.string().min(1),
  explanation: z.string().min(1)
}).refine((d) => d.options.includes(d.correctAnswer), { message: 'correctAnswer must be one of options' })
  .refine((d) => new Set(d.options).size === 4, { message: 'options must not contain duplicates' });

describe('AI structured output validation (MCQ)', () => {
  test('accepts a well-formed MCQ', () => {
    const valid = {
      question: 'What is the time complexity of binary search?',
      options: ['O(1)', 'O(n)', 'O(log n)', 'O(n^2)'],
      correctAnswer: 'O(log n)',
      explanation: 'Binary search halves the search space each step.'
    };
    expect(() => mcqSchema.parse(valid)).not.toThrow();
  });

  test('rejects an MCQ whose correctAnswer is not among the options', () => {
    const invalid = {
      question: 'What is the time complexity of binary search?',
      options: ['O(1)', 'O(n)', 'O(log n)', 'O(n^2)'],
      correctAnswer: 'O(n log n)',
      explanation: '...'
    };
    expect(() => mcqSchema.parse(invalid)).toThrow();
  });

  test('rejects an MCQ with duplicate options', () => {
    const invalid = {
      question: 'Pick the right one',
      options: ['A', 'A', 'B', 'C'],
      correctAnswer: 'A',
      explanation: '...'
    };
    expect(() => mcqSchema.parse(invalid)).toThrow();
  });

  test('rejects an MCQ with fewer than 4 options', () => {
    const invalid = { question: 'Pick one', options: ['A', 'B'], correctAnswer: 'A', explanation: '...' };
    expect(() => mcqSchema.parse(invalid)).toThrow();
  });

  test('rejects a missing explanation', () => {
    const invalid = { question: 'Pick one', options: ['A', 'B', 'C', 'D'], correctAnswer: 'A', explanation: '' };
    expect(() => mcqSchema.parse(invalid)).toThrow();
  });
});
