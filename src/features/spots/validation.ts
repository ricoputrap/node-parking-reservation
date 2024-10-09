import { z } from 'zod';

export const createSpotSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  garageID: z.number().min(1, 'Garage ID is required'),
});

export const updateSpotSchema = z.object({
  name: z.string().min(1, 'Name is required')
});

export type CreateSpot = z.infer<typeof createSpotSchema>;
export type UpdateSpot = z.infer<typeof updateSpotSchema>;