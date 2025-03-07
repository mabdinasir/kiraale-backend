import { z } from 'zod'

export const contactSchema = z
    .object({
        firstName: z.string().min(1, 'First name is required'),
        lastName: z.string().min(1, 'Last name is required'),
        email: z.string().email('Invalid email format'),
        subject: z.string().min(1, 'Subject is required'),
        message: z.string().min(1, 'Message is required'),
    })
    .strict()
