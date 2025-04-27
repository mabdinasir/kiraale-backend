import { prisma } from '@lib/utils/prismaClient'
import type { RequestHandler } from 'express'
import { z } from 'zod'

const bodySchema = z.object({
    propertyId: z.string().uuid(),
    status: z.enum(['AVAILABLE', 'REJECTED']),
})

const updatePropertyStatus: RequestHandler = async (request, response) => {
    const { propertyId, status } = request.body

    const bodyValidation = bodySchema.safeParse({ propertyId, status })
    if (!bodyValidation.success) {
        response.status(400).json({
            success: false,
            message: 'Invalid property ID or status',
            errors: bodyValidation.error.errors.map((err) => ({
                field: err.path.join('.'),
                message: err.message,
            })),
        })
        return
    }

    try {
        // Check if property exists
        const property = await prisma.property.findUnique({
            where: { id: propertyId, isDeleted: false },
        })

        if (!property) {
            response.status(404).json({ success: false, message: 'Property not found.' })
            return
        }

        // if property status is already set to the same value, return early
        if (property.status === status) {
            response.status(200).json({
                success: true,
                message: 'Property status is already set to the requested value.',
                property,
            })
            return
        }

        // Update property status
        const updatedProperty = await prisma.property.update({
            where: { id: propertyId },
            data: {
                status,
                approvedBy: status === 'AVAILABLE' ? request.user?.id : null,
                approvedAt: status === 'AVAILABLE' ? new Date() : null,
                rejectedAt: status === 'REJECTED' ? new Date() : null,
                rejectedBy: status === 'REJECTED' ? request.user?.id : null,
                updatedBy: request.user?.id,
            },
        })

        response.status(200).json({
            success: true,
            property: updatedProperty,
        })
    } catch (error) {
        response.status(500).json({
            success: false,
            message: `Internal error occurred: ${(error as Error).message}`,
        })
    }
}

export default updatePropertyStatus
