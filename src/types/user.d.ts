import { loginSchema, registerSchema } from '@/schemas/auth.schema'
import { z } from 'zod'
export type User = {
    id: string,
    email: string,
    name: string,
    role: 'customer' | 'provider'
}

export type LoginData = z.infer<typeof loginSchema>
export type RegisterData = z.infer<typeof registerSchema>