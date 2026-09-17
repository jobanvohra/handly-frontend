import { bookingSchema } from '@/schemas/booking.schema'
import { z } from 'zod'

export type BookingInput = z.infer<typeof bookingSchema>