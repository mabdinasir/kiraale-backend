import type { RequestHandler } from 'express'
import { prisma } from '@lib/utils/prismaClient'

const toggleFavoriteProperty: RequestHandler = async (request, response) => {
    try {
        if (!request.user || !request.user.id) {
            response.status(401).json({ success: false, message: 'Unauthorized: User not found in context' })
            return
        }

        const { propertyId } = request.body

        if (!propertyId) {
            response.status(400).json({ success: false, message: 'Property ID is required' })
            return
        }

        // Check if the property exists
        const property = await prisma.property.findUnique({
            where: { id: propertyId },
        })

        if (!property) {
            response.status(404).json({ success: false, message: 'Property not found' })
            // return
        }

        // Check if the property is already favorited by the user
        // const existingFavorite = await prisma.favoriteProperties.findUnique({
        //     where: {
        //         // eslint-disable-next-line camelcase
        //         userId_propertyId: {
        //             userId: request?.user.id,
        //             propertyId,
        //         },
        //     },
        // })

        // if (existingFavorite) {
        //     // Unfavorite the property
        //     await prisma.favoriteProperties.delete({
        //         where: { id: existingFavorite.id },
        //     })

        //     response.status(200).json({
        //         success: true,
        //         message: 'Property unfavorited successfully',
        //         favorited: false,
        //     })
        // } else {
        //     // Favorite the property
        //     const newFavorite = await prisma.favoriteProperties.create({
        //         data: {
        //             userId: request.user.id,
        //             propertyId,
        //         },
        //     })

        //     response.status(201).json({
        //         success: true,
        //         message: 'Property favorited successfully',
        //         favorited: true,
        //         favorite: newFavorite,
        //     })
        // }
    } catch (error) {
        response.status(500).json({
            success: false,
            message: `Internal server error occurred: ${(error as Error).message}`,
        })
    }
}

export default toggleFavoriteProperty
