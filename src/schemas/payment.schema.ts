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

const CallbackMetadataItemSchema = z.object({
    Name: z.string(),
    Value: z.union([z.string(), z.number()]),
})

const CallbackMetadataSchema = z.object({
    Item: z.array(CallbackMetadataItemSchema),
})

export const StkPushCallbackSchema = z.object({
    Body: z.object({
        stkCallback: z.object({
            MerchantRequestID: z.string(),
            CheckoutRequestID: z.string(),
            ResultCode: z.number(),
            ResultDesc: z.string(),
            CallbackMetadata: z.optional(CallbackMetadataSchema),
        }),
    }),
})
