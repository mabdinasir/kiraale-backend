import { prisma } from '@lib/utils/prismaClient'
import type { RequestHandler } from 'express'

const getMyProperties: RequestHandler = async (request, response) => {
    const userId = request.user?.id
    if (!userId) {
        response.status(401).json({ success: false, message: 'Unauthorized, please sign in first!' })
        return
    }

    try {
        const myProperties = await prisma.property.findMany({
            where: {
                userId,
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

        if (myProperties.length === 0) {
            response.status(404).json({ success: false, message: 'You do not have any properties listed.' })
            return
        }

        response.status(200).json({
            success: true,
            myProperties,
        })
    } catch (error) {
        response.status(500).json({
            success: false,
            message: `Internal server error occurred: ${(error as Error).message}`,
        })
    }
}

export default getMyProperties
