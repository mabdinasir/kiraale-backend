import { hashPassword } from '@lib/hashPassword'
import { prisma } from '@lib/utils/prismaClient'
import { resetPasswordSchema } from '@schemas/auth.schema'
import type { RequestHandler } from 'express'

const resetPassword: RequestHandler = async (request, response) => {
    const validationResult = resetPasswordSchema.safeParse(request.body)

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

    const { token, newPassword } = validationResult.data

    try {
        // Find the reset token in database
        const resetToken = await prisma.resetToken.findUnique({
            where: { token },
            include: { user: true },
        })

        // Check if token exists and is not expired
        if (!resetToken || resetToken.expiresAt < new Date()) {
            response.status(400).json({
                success: false,
                message: 'Invalid or expired reset token',
            })
            return
        }

        // Hash the new password
        const hashedPassword = await hashPassword(newPassword)

        // Update user's password
        await prisma.user.update({
            where: { id: resetToken.userId },
            data: { password: hashedPassword },
        })

        // Delete all reset tokens belonging to the user
        await prisma.resetToken.deleteMany({
            where: { userId: resetToken.userId },
        })

        response.json({
            success: true,
            message: 'Password reset successfully',
        })
    } catch (error) {
        response.status(500).json({
            success: false,
            message: `Internal server error occurred: ${(error as Error).message}`,
        })
    }
}

export default resetPassword
