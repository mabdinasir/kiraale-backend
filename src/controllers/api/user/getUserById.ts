import type { RequestHandler } from 'express'
import { prisma } from '@lib/utils/prismaClient'
import { z } from 'zod'
import { omitPassword } from '@lib/utils/omitPassword'

const getUserById: RequestHandler = async (request, response) => {
    try {
        const getUserByIdSchema = z.object({ id: z.string().uuid() })

        const { id } = getUserByIdSchema.parse(request.params)

        const user = await prisma.user.findUnique({ where: { id } })

        let userWithoutPassword = null
        if (user) {
            userWithoutPassword = omitPassword(user)
        }

        response.status(200).json({ success: true, user: userWithoutPassword })
    } catch (error) {
        response.status(500).json({ success: false, message: `Failed to get user: ${(error as Error).message}` })
    }
}

export default getUserById
