import { prisma } from '@lib/utils/prismaClient'
import type { RequestHandler } from 'express'

const getMediaById: RequestHandler = async (request, response) => {
    const { propertyId } = request.params

    try {
        const mediaList = await prisma.media.findMany({ where: { propertyId } })

        if (mediaList.length === 0) {
            response.status(404).json({ success: false, message: 'No media found for this property.' })
        }
        response.status(200).json({ success: true, media: mediaList })
    } catch (error) {
        response.status(500).json({
            success: false,
            message: `Internal error occured: ${(error as Error).message}`,
        })
    }
}

export default getMediaById
