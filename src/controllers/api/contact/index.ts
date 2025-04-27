import { prisma } from '@lib/prismaClient'
import type { RequestHandler } from 'express'
import { contactSchema } from '@schemas/index'

const contact: RequestHandler = async (request, response) => {
    const validationResult = contactSchema.safeParse(request.body)

    if (!validationResult.success) {
        response.status(400).json({
            success: false,
            message: 'Validation failed',
            errors: validationResult.error.errors.map((err) => `${err.path.join('.')}: ${err.message}`),
        })
        return
    }
    try {
        const newContactMessage = await prisma.contact.create({
            data: validationResult.data,
        })

        response.status(201).json({
            success: true,
            message: 'Contact message sent successfully',
            data: newContactMessage,
        })
    } catch (error) {
        response.status(500).json({
            success: false,
            message: `Internal server error occurred: ${(error as Error).message}`,
        })
    }
}

export default contact
