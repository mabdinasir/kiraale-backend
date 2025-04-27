import { prisma } from '@lib/utils/prismaClient'
import { Property } from '@prisma/client'
import type { RequestHandler } from 'express'
import { z } from 'zod'

const paramsSchema = z.object({
    userId: z.string().uuid(),
})

const getPropertiesByUser: RequestHandler = async (request, response) => {
    const userId = request.user?.id || null

    if (!userId) {
        response.status(401).json({
            success: false,
            message: 'Unauthorized. User not authenticated!',
        })
        return
    }

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
        const loggedInUserId = request.user?.id || null // Get the logged-in user's ID, or null if not logged in

        // Fetch properties by user ID
        const properties = await prisma.property.findMany({
            where: {
                userId,
                isDeleted: false,
            },
            include: {
                features: true,
                media: true,
                user: { select: { id: true, firstName: true, lastName: true, mobile: true, email: true } },
            },
        })

        // Check if each property is favorited by the logged-in user
        const propertiesWithFavoritedStatus = await Promise.all(
            properties.map(async (property: Property) => {
                let isFavorited = false
                if (loggedInUserId) {
                    const favorite = await prisma.favoriteProperties.findUnique({
                        where: {
                            // eslint-disable-next-line camelcase
                            userId_propertyId: {
                                userId: loggedInUserId,
                                propertyId: property.id,
                            },
                        },
                    })
                    isFavorited = Boolean(favorite)
                }

                // Add the isFavorited field to the property object
                return {
                    ...property,
                    isFavorited,
                }
            }),
        )

        if (!propertiesWithFavoritedStatus.length) {
            response.status(404).json({
                success: false,
                message: 'No properties found for this user.',
            })
            return
        }

        response.status(200).json({ success: true, properties: propertiesWithFavoritedStatus })
    } catch (error) {
        response.status(500).json({
            success: false,
            message: `Internal error occurred: ${(error as Error).message}`,
        })
    }
}

export default getPropertiesByUser
