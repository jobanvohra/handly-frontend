import { z } from 'zod'

export const reviewSchema = z.object({
    booking: z.string().min(1, 'Booking is required'),
    rating: z.number().int().min(1, 'Please select a rating').max(5, 'Rating cannot exceed 5'),
    comment: z.string().max(500, 'Comment cannot exceed 500 character')
})