import { z } from 'zod'

export const validateKenyanNumber = (phone: string): boolean => {
    const kenyanRegex = /^(?:\+?254|0)(7[0-9])\d{7}$/
    const sanitizedPhone = phone.replace(/\s+/g, '')
    return kenyanRegex.test(sanitizedPhone)
}

export const StkPushSchema = z.object({
    phone: z.string().refine(validateKenyanNumber, {
        message: 'Invalid Kenyan phone number',
    }),
})
