import { z } from 'zod'

export const loginSchema = z.object({
    email: z.string().trim().min(1, 'Email cannot be empty').toLowerCase().pipe(z.email({ message: 'Please enter a valid email address' })),
    password: z.string().min(1, 'Password cannot be empty')
})

export const registerSchema = z.object({
    email: z.string().trim().min(1, 'Email cannot be empty').pipe(z.email({ message: 'Please enter a valid email address' })),
    name: z.string().trim().min(1, 'Name cannot be empty').max(50, 'Name cannot exceed 50 characters'),
    role: z.enum(['customer', 'provider']),
    password: z.string().min(8, 'Password must be atleast 8 characters long'),
    confirmPassword: z.string()
}).refine(data => data.password === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword']
})