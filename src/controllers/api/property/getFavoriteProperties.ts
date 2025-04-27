import type { RequestHandler } from 'express'
import { prisma } from '@lib/prismaClient'

const getFavoriteProperties: RequestHandler = async (request, response) => {
    try {
        if (!request.user || !request.user.id) {
            response.status(401).json({ success: false, message: 'Unauthorized: User not found in context' })
            return
        }

        // Fetch user's favorite properties
        const favorites = await prisma.favoriteProperties.findMany({
            where: { userId: request.user.id },
            include: {
                property: {
                    include: {
                        features: true,
                        media: true,
                        user: { select: { id: true, firstName: true, lastName: true, mobile: true, email: true } },
                    },
                },
            },
        })

        // Extract properties from favorites and add isFavorited field
        const properties = favorites.map((fav) => ({
            ...fav.property,
            isFavorited: true, // Since these are favorites, isFavorited is always true
        }))

        response.status(200).json({
            success: true,
            properties,
        })
    } catch (error) {
        response.status(500).json({
            success: false,
            message: `Internal server error occurred: ${(error as Error).message}`,
        })
    }
}

export default getFavoriteProperties
