import type { RequestHandler } from 'express'
import { prisma } from '@lib/utils/prismaClient'
import { propertySearchQuerySchema } from '@schemas/index'
import { Property } from '@prisma/client'

const searchProperties: RequestHandler = async (request, response) => {
    // Validate query parameters
    const result = propertySearchQuerySchema.safeParse(request.query)

    if (!result.success) {
        response.status(400).json({
            success: false,
            message: 'Invalid query parameters',
            errors: result.error.flatten(),
        })
        return
    }

    const { query, minPrice, maxPrice, propertyType, listingType, country } = result.data

    const userId = request.user?.id

    try {
        const properties = await prisma.$queryRaw<Property[]>`
            SELECT 
                p.*,
                to_json(f) AS features,
                json_build_object( -- 👤 Select only specific user fields
                    'id', u.id,
                    'firstName', u."firstName",
                    'lastName', u."lastName",
                    'mobile', u."mobile",
                    'email', u.email
                ) AS user, 
                COALESCE(json_agg(m) FILTER (WHERE m.id IS NOT NULL), '[]') AS media,
                EXISTS ( -- 👇 Check if the property is favorited by the logged-in user
                    SELECT 1
                    FROM "FavoriteProperties" fp
                    WHERE fp."propertyId" = p.id
                    AND fp."userId" = ${userId}
                ) AS "isFavorited"
            FROM "Property" p
            LEFT JOIN "Features" f ON p.id = f."propertyId"
            LEFT JOIN "Media" m ON p.id = m."propertyId"
            LEFT JOIN "User" u ON p."userId" = u.id 
            WHERE 
                p.country = ${country}::"Country"
                AND (${query}::TEXT IS NULL OR ${query} = '' OR
                similarity(p.title, ${query}) > 0.2 
                OR similarity(p.description, ${query}) > 0.1 
                OR similarity(p.address, ${query}) > 0.2)
                AND (${minPrice}::NUMERIC IS NULL OR p.price >= ${minPrice}::NUMERIC)
                AND (${maxPrice}::NUMERIC IS NULL OR p.price <= ${maxPrice}::NUMERIC)
                AND (${propertyType}::TEXT IS NULL OR p."propertyType" = ${propertyType}::"PropertyType")
                AND (${listingType}::TEXT IS NULL OR p."listingType" = ${listingType}::"ListingType")
                AND p.status NOT IN ('PENDING', 'REJECTED', 'EXPIRED')
                AND p."isDeleted" = false
            GROUP BY p.id, f.id, u.id
            ORDER BY GREATEST(
                similarity(p.title, COALESCE(${query}, '')), 
                similarity(p.description, COALESCE(${query}, '')), 
                similarity(p.address, COALESCE(${query}, ''))
            ) DESC
        `

        if (!properties || properties.length === 0) {
            response.status(404).json({
                success: false,
                message: 'No properties found.',
            })
            return
        }

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

export default searchProperties
