import { z } from 'zod';

export const registerSchema = z.object({
  firstName: z.string().min(2, 'Le prénom doit contenir au moins 2 caractères').max(50).optional(),
  lastName: z.string().min(2, 'Le nom doit contenir au moins 2 caractères').max(50).optional(),
  email: z.string().email('Email invalide').optional(),
  phone: z.string().min(10, 'Numéro de téléphone invalide').optional(),
  password: z.string().min(6, 'Le mot de passe doit contenir au moins 6 caractères'),
  country: z.string().optional(),
}).refine(data => data.email || data.phone, {
  message: "Email ou numéro de téléphone requis"
});