import { bookingSchema } from '@/schemas/booking.schema'
import { z } from 'zod'

export type BookingInput = z.infer<typeof bookingSchema>
export type BookingStatus = 'pending' | 'accepted' | 'declined' | 'completed' | 'cancelled' | 'expired'


export type BookingResponse = {
    _id: string,
    provider: {
        _id: string;
        category: string;
        user: {
            _id: string;
            name: string
        }
    },
    customer: { _id: string; name: string },
    status: BookingStatus,
    requestedTime: string,
    notes: string,
    exactAddress: string,
    geocodeAddress: string,
    serviceLocation: {
        type: 'Point',
        coordinates: [
            number, number
        ]
    }
}