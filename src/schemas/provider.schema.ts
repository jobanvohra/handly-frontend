import { z } from 'zod';
import { ALLOWED_CATEGORY_VALUES } from '@/constants/categories';

export const providerProfileFormSchema = z.object({
    category: z.string().refine((val) => ALLOWED_CATEGORY_VALUES.includes(val as any), {
        message: 'Please select a valid service category',
    }),
    bio: z.string().max(500, 'Bio must not exceed 500 characters').optional(),
    ratePerHour: z.number().positive('Rate must be a positive number'),
    serviceRadiusKm: z.number().positive().max(100, 'Max radius is 100km'),
});
