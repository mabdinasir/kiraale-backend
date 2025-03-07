import { prisma } from '@lib/utils/prismaClient'
import type { RequestHandler } from 'express'
import { z } from 'zod'

const emailSchema = z.object({
    email: z.string().email().min(1, { message: 'Email is required' }),
})

const addSubscriber: RequestHandler = async (request, response) => {
    const validationResult = emailSchema.safeParse(request.body)

    if (!validationResult.success) {
        response.status(400).json({
            success: false,
            message: 'Validation failed',
            errors: validationResult.error.errors.map((err) => `${err.path.join('.')}: ${err.message}`),
        })
        return
    }

    const { email } = validationResult.data

    try {
        const existingSubscriber = await prisma.subscriber.findFirst({
            where: { email },
        })

        if (existingSubscriber) {
            response.status(409).json({ success: false, message: 'Email already subscribed.' })
            return
        }

        const newSubscriber = await prisma.subscriber.create({
            data: { email },
        })

        response.status(201).json({ success: true, subscriber: newSubscriber })
    } catch (error) {
        response.status(500).json({
            success: false,
            message: `Internal server error occurred: ${(error as Error).message}`,
        })
    }
}

export default addSubscriber
