import { prisma } from '@lib/prismaClient'
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
        const userId = request.user?.id || null // Get the logged-in user's ID, or null if not logged in

        const property = await prisma.property.findUnique({
            where: { id, isDeleted: false },
            include: {
                features: true,
                media: true,
                user: { select: { id: true, firstName: true, lastName: true, mobile: true, email: true } },
            },
        })

        if (!property) {
            response.status(404).json({ success: false, message: 'Property not found.' })
            return
        }

        // Check if the property is favorited by the logged-in user
        let isFavorited = false
        if (userId) {
            const favorite = await prisma.favoriteProperties.findUnique({
                where: {
                    // eslint-disable-next-line camelcase
                    userId_propertyId: {
                        userId,
                        propertyId: id,
                    },
                },
            })
            isFavorited = Boolean(favorite)
        }

        // Add the isFavorited field to the property object
        const propertyWithFavoritedStatus = {
            ...property,
            isFavorited,
        }

        response.status(200).json({ success: true, property: propertyWithFavoritedStatus })
    } catch (error) {
        response.status(500).json({
            success: false,
            message: `Internal error occurred: ${(error as Error).message}`,
        })
    }
}

export default getPropertyById
