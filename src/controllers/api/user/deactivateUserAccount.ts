import { prisma } from '@lib/prismaClient'
import type { RequestHandler } from 'express'

const deactivateUserAccount: RequestHandler = async (request, response) => {
    const userId = request.user?.id
    if (!userId) {
        response.status(400).json({ success: false, message: 'No user ID found in request' })
        return
    }

    try {
        // Fetch user from the database
        const user = await prisma.user.findUnique({ where: { id: userId } })
        if (!user) {
            response.status(404).json({ success: false, message: 'User not found' })
            return
        }

        // Mark the user as deleted
        await prisma.user.update({
            where: { id: userId },
            data: { isDeleted: true },
        })

        response.json({ success: true, message: 'Account deactivated successfully' })
    } catch (error) {
        response.status(500).json({
            success: false,
            message: `Internal server error occurred: ${(error as Error).message}`,
        })
    }
}

export default deactivateUserAccount
