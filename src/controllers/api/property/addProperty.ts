import type { RequestHandler } from 'express'
import { prisma } from '@lib/utils/prismaClient'
import { propertySchema } from '@schemas/index'

const addProperty: RequestHandler = async (request, response) => {
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

    try {
        if (!request.user?.id) {
            response.status(401).json({
                success: false,
                message: 'Unauthorized: User not found in context',
            })
            return
        }

        const newProperty = await prisma.property.create({
            data: {
                ...propertyData,
                userId: request.user.id,
                // expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 days from now
                expiresAt: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000), // 1 day from now
                features: {
                    create: features || {}, // Handle case where features might be undefined
                },
            },
            include: {
                features: true,
            },
        })

        response.status(201).json({
            success: true,
            message: 'Property added successfully',
            property: newProperty,
        })
    } catch (error) {
        response.status(500).json({
            success: false,
            message: `Internal server error occurred: ${(error as Error).message}`,
        })
    }
}

export default addProperty
