import type { RequestHandler } from 'express'
import { prisma } from '@lib/utils/prismaClient'

const getFeaturedProperties: RequestHandler = async (_request, response) => {
    try {
        const properties = await prisma.property.findMany({
            take: 6,
            where: {
                status: { in: ['AVAILABLE'] },
            },
            orderBy: {
                createdAt: 'desc',
            },
            include: {
                features: true,
                media: true,
                user: {
                    select: {
                        firstName: true,
                        lastName: true,
                        mobile: true,
                        email: true,
                    },
                },
            },
        })

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

export default getFeaturedProperties
