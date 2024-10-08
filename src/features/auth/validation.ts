// src/validators/userValidator.ts
import { z } from 'zod';
import { EnumUserRole } from '../../../config/enums';

export const userRegistrationSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  email: z.string().email('Invalid email format'),
  password: z.string().min(8, 'Password must be at least 8 characters long'),
  role: z.enum([EnumUserRole.USER, EnumUserRole.GARAGE_ADMIN, EnumUserRole.SUPER_ADMIN]),
});

// Create a type for TypeScript
export type UserRegistration = z.infer<typeof userRegistrationSchema>;

export const userLoginSchema = z.object({
  email: z.string().email('Invalid email format'),
  password: z.string().min(8, 'Password must be at least 8 characters long'),
});

// Create a type for TypeScript
export type UserLogin = z.infer<typeof userLoginSchema>;