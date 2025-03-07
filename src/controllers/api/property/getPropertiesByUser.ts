import { prisma } from '@lib/utils/prismaClient'
import type { RequestHandler } from 'express'
import { z } from 'zod'

const paramsSchema = z.object({
    userId: z.string().uuid(),
})

const getPropertiesByUser: RequestHandler = async (request, response) => {
    const { userId } = request.params

    // Validate the userId parameter
    const validationResult = paramsSchema.safeParse({ userId })
    if (!validationResult.success) {
        response.status(400).json({
            success: false,
            message: 'Invalid user ID.',
        })
        return
    }

    try {
        // Fetch properties by user ID
        const properties = await prisma.property.findMany({
            where: { userId },
            include: {
                features: true,
                media: true,
                user: { select: { firstName: true, lastName: true, mobile: true, email: true } },
            },
        })

        if (properties.length === 0) {
            response.status(404).json({ success: false, message: 'No properties found for this user.' })
            return
        }

        response.status(200).json({ success: true, properties })
    } catch (error) {
        response.status(500).json({
            success: false,
            message: `Internal error occurred: ${(error as Error).message}`,
        })
    }
}

export default getPropertiesByUser
