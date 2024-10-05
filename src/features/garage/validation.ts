import { z } from 'zod';

export const garageSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  location: z.string().min(1, 'Location is required'),
  pricePerHour: z.number().min(1, 'Price per hour is required'),
});

export type GarageRegistration = z.infer<typeof garageSchema>;