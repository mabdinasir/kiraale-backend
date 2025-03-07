import { prisma } from '@lib/utils/prismaClient'
import type { RequestHandler } from 'express'
import { z } from 'zod'

const emailSchema = z.string().email().min(1, { message: 'Email is required' })

const deleteSubscriber: RequestHandler = async (request, response) => {
    const { email } = request.params

    const validationResult = emailSchema.safeParse(email)

    if (!validationResult.success) {
        response.status(400).json({
            success: false,
            message: 'Validation failed',
            errors: validationResult.error.errors.map((err) => `${err.path.join('.')}: ${err.message}`),
        })
        return
    }

    const validatedEmail = validationResult.data

    try {
        const existingSubscriber = await prisma.subscriber.findFirst({
            where: { email: validatedEmail },
        })

        if (!existingSubscriber) {
            response.status(404).json({ success: false, message: 'Email not subscribed.' })
            return
        }

        await prisma.subscriber.delete({
            where: { id: existingSubscriber.id },
        })

        response.status(200).json({ success: true, message: 'Subscriber removed successfully.' })
    } catch (error) {
        response.status(500).json({
            success: false,
            message: `Internal server error occurred: ${(error as Error).message}`,
        })
    }
}

export default deleteSubscriber
