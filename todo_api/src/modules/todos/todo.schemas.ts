import { z } from 'zod';

export const todoIdSchema = z.object({
  id: z.string().regex(/^[0-9a-f]{24}$/i, 'Invalid id'),
});

export const createTodoSchema = z.object({
  title: z.string().trim().min(1).max(200),
  dueDate: z.coerce.date().nullable().optional(),
});

export const updateTodoSchema = z
  .object({
    title: z.string().trim().min(1).max(200),
    completed: z.boolean(),
    dueDate: z.coerce.date().nullable(),
  })
  .partial()
  .refine((value) => Object.keys(value).length > 0, {
    message: 'Provide at least one field to update',
  });

// Query strings are always text: coerce them to the types we want.
export const listTodosSchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  completed: z
    .enum(['true', 'false'])
    .transform((value) => value === 'true')
    .optional(),
});

export type CreateTodoInput = z.infer<typeof createTodoSchema>;
export type UpdateTodoInput = z.infer<typeof updateTodoSchema>;
export type ListTodosQuery = z.infer<typeof listTodosSchema>;