import { hashPassword, verifyPassword } from '@lib/hashPassword'
import { prisma } from '@lib/utils/prismaClient'
import { passwordSchema } from '@schemas/profile.schema'
import type { RequestHandler } from 'express'

const updateUserPassword: RequestHandler = async (request, response) => {
    const userId = request.user?.id
    if (!userId) {
        response.status(400).json({ success: false, message: 'No user ID found in request' })
        return
    }

    // Validate request body
    const validationResult = passwordSchema.safeParse(request.body)

    if (!validationResult.success) {
        response.status(400).json({
            success: false,
            message: 'Validation failed',
            errors: validationResult.error.errors.map((err) => ({
                path: err.path.join('.'),
                message: err.message,
            })),
        })
        return
    }

    const { oldPassword, newPassword } = validationResult.data

    try {
        // Fetch user from the database
        const user = await prisma.user.findUnique({ where: { id: userId } })
        if (!user) {
            response.status(404).json({ success: false, message: 'User not found' })
            return
        }

        // Verify old password
        await verifyPassword(oldPassword, user.password, response)

        // Hash the new password
        const hashedNewPassword = await hashPassword(newPassword)

        // Update the user's password in the database
        await prisma.user.update({
            where: { id: userId },
            data: { password: hashedNewPassword },
        })

        response.json({ success: true, message: 'Password updated successfully' })
    } catch (error) {
        response.status(500).json({
            success: false,
            message: `Internal server error occurred: ${(error as Error).message}`,
        })
    }
}

export default updateUserPassword
