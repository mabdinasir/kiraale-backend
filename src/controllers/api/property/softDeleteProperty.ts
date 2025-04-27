import { prisma } from '@lib/prismaClient'
import type { RequestHandler } from 'express'
import { z } from 'zod'

const paramsSchema = z.object({
    id: z.string().uuid(),
})

const softDeleteProperty: RequestHandler = async (request, response) => {
    const { id } = request.params

    const validationResult = paramsSchema.safeParse({ id })
    if (!validationResult.success) {
        response.status(400).json({
            success: false,
            message: 'Invalid property ID.',
            errors: validationResult.error.errors.map((err) => ({
                field: err.path.join('.'),
                message: err.message,
            })),
        })
        return
    }

    try {
        // First check if property exists
        const property = await prisma.property.findUnique({
            where: { id },
        })

        if (!property) {
            response.status(404).json({ success: false, message: 'Property not found.' })
            return
        }

        if (property.isDeleted) {
            response.status(400).json({
                success: false,
                message: 'Property is already marked as deleted.',
            })
            return
        }

        // Update property status to mark as deleted
        const updatedProperty = await prisma.property.update({
            where: { id },
            data: {
                isDeleted: true,
                updatedBy: request.user?.id,
                deletedBy: request.user?.id,
                deletedAt: new Date(),
            },
        })

        response.status(200).json({
            success: true,
            message: 'Property marked as deleted successfully.',
            property: updatedProperty,
        })
    } catch (error) {
        response.status(500).json({
            success: false,
            message: `Internal error occurred: ${(error as Error).message}`,
        })
    }
}

export default softDeleteProperty
