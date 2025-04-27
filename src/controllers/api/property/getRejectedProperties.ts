import { prisma } from '@lib/prismaClient'
import type { RequestHandler } from 'express'

const getRejectedProperties: RequestHandler = async (request, response) => {
    try {
        const user = request.user

        // Check if user is ADMIN or MODERATOR
        if (user?.role !== 'ADMIN' && user?.role !== 'MODERATOR') {
            response.status(403).json({
                success: false,
                message: 'Unauthorized: Only admins/moderators can view rejected properties.',
            })
            return
        }

        const properties = await prisma.property.findMany({
            where: {
                status: 'REJECTED',
                isDeleted: false,
            },
            include: {
                features: true,
                media: true,
                user: {
                    select: {
                        id: true,
                        firstName: true,
                        lastName: true,
                        mobile: true,
                        email: true,
                    },
                },
            },
        })

        if (!properties.length) {
            response.status(404).json({
                success: false,
                message: 'No rejected properties found.',
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
            message: `Internal server error: ${(error as Error).message}`,
        })
    }
}

export default getRejectedProperties
