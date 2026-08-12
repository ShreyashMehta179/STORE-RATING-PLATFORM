import { z } from 'zod';

export const createStoreSchema = z.object({
  name: z.string().min(2, 'Store name must be at least 2 characters').max(100, 'Store name too long'),
  email: z.string().email('Invalid email address'),
  address: z.string().min(5, 'Address must be at least 5 characters').max(400, 'Address max 400 characters'),
  ownerId: z.string().min(1, 'Store Owner ID is required'),
  description: z.string().min(10, 'Description must be at least 10 characters'),
  category: z.string().min(2, 'Category is required'),
  phone: z.string().min(5, 'Phone number is required'),
  website: z.string().url('Invalid URL format').optional().or(z.literal('')),
  imageUrl: z.string().url('Invalid Image URL').optional().or(z.literal('')),
  isActive: z.boolean().optional().default(true),
});

export const updateStoreSchema = createStoreSchema.partial();
