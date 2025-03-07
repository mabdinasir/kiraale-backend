import type { RequestHandler } from 'express'
import { prisma } from '@utils/prismaClient'
import { omitPassword } from '@lib/utils/omitPassword'
import { profileSchema } from 'schemas'
import { z } from 'zod'

const updateProfile: RequestHandler = async (request, response) => {
    try {
        const userId = request.user?.id
        if (!userId) {
            response.status(401).json({ success: false, message: 'Unauthorized' })
            return
        }

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
        }

        response.status(500).json({
            success: false,
            message: `Internal error occurred: ${(error as Error).message}`,
        })
    }
}

export default updateProfile
