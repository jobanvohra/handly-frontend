import { reviewSchema } from '@/schemas/review.schema'
import { z } from 'zod'

export type ReviewInput = z.infer<typeof reviewSchema>