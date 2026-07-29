import { z } from 'zod';

export const RegisterSchema = z.object({
  email: z
    .email('Invalid email format')
    .max(255, 'Email must be 255 characters or fewer')
    .transform((v) => v.toLowerCase()),

  password: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .max(128, 'Password must be 128 characters or fewer'),
  // Max 128 prevents DoS via Argon2 on huge inputs.

  name: z
    .string()
    .min(1, 'Name is required')
    .max(255, 'Name must be 255 characters or fewer')
    .trim(),
  // .trim() removes leading/trailing whitespace.
});

export const LoginSchema = z.object({
  email: z.email('Invalid email format').transform((v) => v.toLowerCase()),
  password: z.string().min(1, 'Password is required'),
});

export const RefreshSchema = z.object({
  refreshToken: z.string().min(1, 'Refresh token is required'),
});

export type RegisterInput = z.infer<typeof RegisterSchema>;
export type LoginInput = z.infer<typeof LoginSchema>;
export type RefreshInput = z.infer<typeof RefreshSchema>;
