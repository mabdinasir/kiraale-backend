import type { RequestHandler } from 'express'
import { prisma } from '@lib/utils/prismaClient'
import { propertySchema } from '@schemas/index'

const addProperty: RequestHandler = async (request, response) => {
    const validationResult = propertySchema.safeParse(request.body)

    if (!validationResult.success) {
        response.status(400).json({
            success: false,
            message: 'Validation failed',
            errors: validationResult.error.errors.map((err) => `${err.path.join('.')}: ${err.message}`),
        })
        return
    }

    const propertyData = validationResult.data

    try {
        if (!request.user || !request.user.id) {
            response.status(401).json({ success: false, message: 'Unauthorized: User not found in context' })
            return
        }

        const newProperty = await prisma.property.create({
            data: {
                title: propertyData.title,
                description: propertyData.description,
                address: propertyData.address,
                price: propertyData.price,
                propertyType: propertyData.propertyType,
                userId: request.user.id,
                features: {
                    create: {
                        bedrooms: propertyData.bedrooms,
                        bathrooms: propertyData.bathrooms,
                        parking: propertyData.parking,
                        area: propertyData.area,
                        yearBuilt: propertyData.yearBuilt,
                        pool: propertyData.pool,
                        furnished: propertyData.furnished,
                        dishwasher: propertyData.dishwasher,
                        airConditioning: propertyData.airConditioning,
                        laundry: propertyData.laundry,
                        wardrobe: propertyData.wardrobe,
                        oven: propertyData.oven,
                    },
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
