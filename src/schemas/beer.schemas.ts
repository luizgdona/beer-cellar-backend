import { z } from 'zod';

export const CreateBeerSchema = z.object({
  name: z.string().min(1, 'Beer name is required').max(255),
  brewery: z.string().min(1, 'Brewery name is required').max(255),
  style: z.string().max(100).optional(),
  abv: z.number().min(0).max(70).optional(),
  ibu: z.number().min(0).max(1000).optional(),
  additives: z.string().optional(),
  purchaseDate: z.string().datetime().optional(),
  purchaseValue: z.number().positive().optional(),
  purchaseLocation: z.string().max(255).optional(),
  expirationDate: z.string().datetime().optional(),
  consumptionReminderDate: z.string().datetime().optional(),
  volume: z.string().max(50).optional(),
  imageUrl: z.string().url().optional(),
  description: z.string().optional(),
  rating: z.number().min(0).max(5).optional(),
  notes: z.string().optional(),
});

export const UpdateBeerSchema = CreateBeerSchema.partial();

export const BeerIdSchema = z.object({
  id: z.string().uuid('Invalid beer ID'),
});

export const ConsumeBeerSchema = z.object({
  consumedAt: z.string().datetime().optional(),
});

export type CreateBeerInput = z.infer<typeof CreateBeerSchema>;
export type UpdateBeerInput = z.infer<typeof UpdateBeerSchema>;
export type ConsumeBeerInput = z.infer<typeof ConsumeBeerSchema>;
