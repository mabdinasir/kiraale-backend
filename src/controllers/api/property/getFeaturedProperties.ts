import type { RequestHandler } from 'express'
import { prisma } from '@lib/prismaClient'
import { Property, FavoriteProperties } from '@prisma/client'

const getFeaturedProperties: RequestHandler = async (request, response) => {
    try {
        const userId = request?.user?.id

        // Fetch featured properties
        const properties = await prisma.property.findMany({
            take: 6,
            where: {
                status: { notIn: ['PENDING', 'REJECTED', 'EXPIRED'] },
                isDeleted: false,
            },
            orderBy: {
                createdAt: 'desc',
            },
            include: {
                features: true,
                media: true,
                user: { select: { id: true, firstName: true, lastName: true, mobile: true, email: true } },
            },
        })

        // Check if each property is favorited by the logged-in user (if userId is not empty)
        const propertiesWithFavoritedStatus = await Promise.all(
            properties.map(async (property: Property) => {
                let isFavorited = false
                if (userId) {
                    const favoriteProperty: FavoriteProperties | null = await prisma.favoriteProperties.findUnique({
                        where: {
                            // eslint-disable-next-line camelcase
                            userId_propertyId: {
                                userId,
                                propertyId: property.id,
                            },
                        },
                    })
                    isFavorited = Boolean(favoriteProperty)
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
                message: 'No featured properties found.',
            })
            return
        }

        response.status(200).json({
            success: true,
            properties: propertiesWithFavoritedStatus,
        })
    } catch (error) {
        response.status(500).json({
            success: false,
            message: `Internal server error occurred: ${(error as Error).message}`,
        })
    }
}

export default getFeaturedProperties
