import type { RequestHandler } from 'express'
import { z } from 'zod'
import { verifyPassword } from '@lib/hashPassword'
import { generateJwtToken } from '@lib/generateJwtToken'
import { loginSchema } from '@schemas/index'
import { prisma } from '@lib/utils/prismaClient'
import { omitPassword } from '@lib/utils/omitPassword'

const login: RequestHandler = async (request, response) => {
    try {
        // Validate request body with Zod
        const userData = await loginSchema.parseAsync(request.body)

        const existingUser = await prisma.user.findUnique({ where: { email: userData.email } })
        if (!existingUser) {
            response.status(404).json({ success: false, message: 'Sorry, user not found!' })
            return
        }

        // Verify password
        await verifyPassword(userData.password, existingUser?.password || '', response)

        // Update user's signed-in status
        const loggedInUser = await prisma.user.update({
            where: { id: existingUser?.id },
            data: { isSignedIn: true, isDeleted: false },
        })

        // Generate JWT and remove password from response
        const jwt = generateJwtToken(loggedInUser)
        const userWithoutPassword = omitPassword(loggedInUser)

        response.status(200).json({
            success: true,
            message: 'User signed in successfully!',
            user: userWithoutPassword,
            jwt,
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

export default login
