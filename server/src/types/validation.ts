import { z } from 'zod';

// Item validation schemas
export const createItemSchema = z.object({
  type: z.enum(['note', 'image', 'text', 'shape']),
  content: z.string().min(1).max(10000),
  x: z.number().int().min(0).max(10000),
  y: z.number().int().min(0).max(10000),
  width: z.number().int().min(50).max(1000).optional(),
  height: z.number().int().min(50).max(1000).optional(),
  color: z.string().max(50).optional(),
  thumbtackColor: z.string().max(50).optional(),
  zIndex: z.number().int().min(0).max(1000).optional(),
  rotation: z.number().min(-360).max(360).optional(),
  metadata: z.record(z.union([z.string(), z.array(z.string())])).optional(),
});

export const updateItemSchema = z.object({
  content: z.string().min(1).max(10000).optional(),
  x: z.number().int().min(0).max(10000).optional(),
  y: z.number().int().min(0).max(10000).optional(),
  width: z.number().int().min(50).max(1000).optional(),
  height: z.number().int().min(50).max(1000).optional(),
  color: z.string().max(50).optional(),
  thumbtackColor: z.string().max(50).optional(),
  zIndex: z.number().int().min(0).max(1000).optional(),
  rotation: z.number().min(-360).max(360).optional(),
  metadata: z.record(z.union([z.string(), z.array(z.string())])).optional(),
});

// Connection validation schemas
export const createConnectionSchema = z.object({
  fromItemId: z.string().uuid(),
  toItemId: z.string().uuid(),
  label: z.string().max(200).optional(),
  style: z
    .object({
      color: z.string().max(50).optional(),
      thickness: z.number().min(1).max(10).optional(),
      pattern: z.enum(['solid', 'dashed', 'dotted']).optional(),
    })
    .optional(),
});

// Board validation schemas
export const createBoardSchema = z.object({
  title: z.string().min(1).max(255),
  description: z.string().max(1000).optional(),
});

export const updateBoardSchema = z.object({
  title: z.string().min(1).max(255).optional(),
  description: z.string().max(1000).optional(),
});

// Query parameter schemas
export const paginationSchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
});

export type CreateItemInput = z.infer<typeof createItemSchema>;
export type UpdateItemInput = z.infer<typeof updateItemSchema>;
export type CreateConnectionInput = z.infer<typeof createConnectionSchema>;
export type CreateBoardInput = z.infer<typeof createBoardSchema>;
export type UpdateBoardInput = z.infer<typeof updateBoardSchema>;
