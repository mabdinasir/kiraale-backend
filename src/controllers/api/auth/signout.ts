import type { RequestHandler } from 'express'
import { prisma } from '@lib/prismaClient'

const signOut: RequestHandler = async (request, response) => {
    try {
        await prisma.$transaction([
            prisma.user.update({ where: { id: request?.user?.id }, data: { isSignedIn: false } }),
            prisma.tokenBlacklist.create({ data: { token: request?.token ?? '' } }),
        ])

        response.status(200).json({ success: true, message: 'Signed out successfully' })
    } catch (error) {
        response.status(500).json({ success: false, message: `Signout failed: ${(error as Error).message}` })
    }
}

export default signOut
