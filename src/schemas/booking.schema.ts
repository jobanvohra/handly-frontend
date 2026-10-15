import { z } from 'zod'

const MAX_BOOKING_DAYS_AHEAD = 7

export const bookingSchema = z.object({
    exactAddress: z.string().min(1, 'Address cannot be empty'),
    requestedTime: z.coerce.date().refine(
        (date) => date.getTime() > Date.now() + 60 * 60 * 1000 &&
            date.getTime() <= Date.now() + MAX_BOOKING_DAYS_AHEAD * 24 * 60 * 60 * 1000,
        `Booking must be between 1 hour and ${MAX_BOOKING_DAYS_AHEAD} days from now`
    ),
    notes: z.string(),
})
