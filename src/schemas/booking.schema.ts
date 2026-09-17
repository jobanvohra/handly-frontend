import { z } from 'zod'

export const bookingSchema = z.object({
    exactAddress: z.string().min(1, 'Address cannot be empty'),
    requestedTime: z.coerce.date().refine(
        (date) => date.getTime() > Date.now() + 60 * 60 * 1000,
        'Booking must be at least 1 hour in advance'
    ),
    notes: z.string(),
})
