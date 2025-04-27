import type { RequestHandler } from 'express'
import { prisma } from '@lib/prismaClient'
import { omitPassword } from '@lib/utils/security/omitPassword'
import { profileSchema } from '@schemas/index'
import { z } from 'zod'

const updateProfile: RequestHandler = async (request, response) => {
    const userId = request.user?.id
    if (!userId) {
        response.status(400).json({ success: false, message: 'No user ID found in request' })
        return
    }

    try {
        // Validate request body
        const profileData = await profileSchema.parseAsync(request.body)

        // Update user profile
        const updatedUser = await prisma.user.update({
            where: { id: userId },
            data: profileData,
        })

        const userWithoutPassword = omitPassword(updatedUser)

        response.status(200).json({
            success: true,
            message: 'Profile updated successfully!',
            user: userWithoutPassword,
        })
    } catch (error) {
        if (error instanceof z.ZodError) {
            response.status(400).json({
                success: false,
                message: 'Validation failed',
                errors: error.errors.map((err) => ({
                    field: err.path.join('.'),
                    message: err.message,
                })),
            })
            return
        }

        response.status(500).json({
            success: false,
            message: `Internal error occurred: ${(error as Error).message}`,
        })
    }
}

export default updateProfile
