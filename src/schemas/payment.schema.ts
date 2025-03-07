import { z } from 'zod'

export const StkPushSchema = z.object({
    phone: z.string().min(1, 'Phone number is required'),
    amount: z.number().min(1, 'Amount must be greater than zero'),
})
