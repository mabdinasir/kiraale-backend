import { prisma } from '@lib/utils/prismaClient'
import type { RequestHandler } from 'express'
import { z } from 'zod'

const paramsSchema = z.object({
    id: z.string().uuid(),
})

const getPropertyById: RequestHandler = async (request, response) => {
    const { id } = request.params

    const validationResult = paramsSchema.safeParse({ id })
    if (!validationResult.success) {
        response.status(400).json({
            success: false,
            message: 'Invalid property ID.',
        })
        return
    }

    try {
        const property = await prisma.property.findUnique({
            where: { id },
            include: {
                features: true,
                media: true,
                user: { select: { firstName: true, lastName: true, mobile: true, email: true } },
            },
        })

        if (!property) {
            response.status(404).json({ success: false, message: 'Property not found.' })
            return
        }
        response.status(200).json({ success: true, property })
    } catch (error) {
        response.status(500).json({
            success: false,
            message: `Internal error occured: ${(error as Error).message}`,
        })
    }
}

export default getPropertyById
