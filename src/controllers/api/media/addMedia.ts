import { prisma } from '@lib/utils/prismaClient'
import type { RequestHandler } from 'express'
import { mediaSchema } from '@schemas/index'

const addMedia: RequestHandler = async (request, response) => {
    const userId = request.user?.id
    if (!userId) {
        response.status(401).json({ success: false, message: 'Unauthorized, please sign in first!' })
        return
    }

    // Validate the request body
    const validationResult = mediaSchema.safeParse(request.body)

    // Handle validation errors
    if (!validationResult.success) {
        response.status(400).json({
            success: false,
            message: 'Validation failed',
            errors: validationResult.error.errors.map((err) => `${err.path.join('.')}: ${err.message}`),
        })
        return
    }

    // At this point, validationResult.data is guaranteed to exist
    const media = validationResult.data

    try {
        // Check if the property exists
        const property = await prisma.property.findUnique({
            where: { id: media.propertyId },
        })

        if (!property) {
            response.status(404).json({ success: false, message: 'Property not found.' })
            return
        }

        // Create the new media
        const newMedia = await prisma.media.create({
            data: {
                url: media.url,
                type: media.type,
                uploadedBy: userId,
                property: { connect: { id: media.propertyId } },
            },
        })

        response.status(201).json({ success: true, media: newMedia })
    } catch (error) {
        response.status(500).json({
            success: false,
            message: `Internal server error occurred: ${(error as Error).message}`,
        })
    }
}

export default addMedia
