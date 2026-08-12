import { z } from 'zod';

export const ratingSchema = z.object({
  storeId: z.string().min(1, 'Store ID is required'),
  rating: z.number().int().min(1, 'Rating must be between 1 and 5').max(5, 'Rating must be between 1 and 5'),
  review: z.string().max(1000, 'Review cannot exceed 1000 characters').optional().or(z.literal('')),
});

export const updateRatingSchema = z.object({
  rating: z.number().int().min(1, 'Rating must be between 1 and 5').max(5, 'Rating must be between 1 and 5'),
  review: z.string().max(1000, 'Review cannot exceed 1000 characters').optional().or(z.literal('')),
});
