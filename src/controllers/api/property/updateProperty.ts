import type { RequestHandler } from 'express'
import { prisma } from '@lib/utils/prismaClient'
import { propertySchema } from '@schemas/index'

const updateProperty: RequestHandler = async (request, response) => {
    const validationResult = propertySchema.safeParse(request.body)

    if (!validationResult.success) {
        response.status(400).json({
            success: false,
            message: 'Validation failed',
            errors: validationResult.error.errors.map((err) => ({
                field: err.path.join('.'),
                message: err.message,
            })),
        })
        return
    }

    const { features, ...propertyData } = validationResult.data
    const propertyId = request.params.id

    if (!propertyId) {
        response.status(400).json({
            success: false,
            message: 'Property ID is required',
        })
        return
    }

    try {
        if (!request.user?.id) {
            response.status(401).json({
                success: false,
                message: 'Unauthorized: User not found in context',
            })
            return
        }

        // Verify property exists and belongs to user
        const existingProperty = await prisma.property.findUnique({
            where: { id: propertyId, isDeleted: false },
            include: { features: true },
        })

        if (!existingProperty) {
            response.status(404).json({
                success: false,
                message: 'Property not found',
            })
        }

        if (existingProperty?.userId !== request.user.id) {
            response.status(403).json({
                success: false,
                message: 'Forbidden: You can only edit your own properties',
            })
            return
        }

        // Update property and features in a transaction
        await prisma.$transaction([
            prisma.property.update({
                where: { id: propertyId },
                data: {
                    ...propertyData,
                    status: 'PENDING',
                    updatedBy: request.user.id,
                },
            }),
            prisma.features.update({
                where: { propertyId },
                data: features || {},
            }),
        ])

        // Fetch the complete updated property with features
        const completeProperty = await prisma.property.findUnique({
            where: { id: propertyId },
            include: { features: true },
        })

        response.status(200).json({
            success: true,
            message: 'Property updated successfully',
            property: completeProperty,
        })
    } catch (error) {
        response.status(500).json({
            success: false,
            message: `Internal server error occurred: ${(error as Error).message}`,
        })
    }
}

export default updateProperty
