import type { RequestHandler } from 'express'
import { hashPassword } from '@lib/utils/security/hashPassword'
import { prisma } from '@lib/prismaClient'
import { z } from 'zod'
import { signUpSchema } from '@schemas/index'
import { omitPassword } from '@lib/utils/security/omitPassword'

const signUp: RequestHandler = async (request, response) => {
    try {
        // Validate request body against schema
        const userData = await signUpSchema.parseAsync(request.body)

        // Check for existing user
        const existingUser = await prisma.user.findUnique({ where: { email: userData.email } })
        if (existingUser) {
            response.status(409).json({ success: false, message: 'User already exists!' })
            return
        }
        // Hash password and create user
        const hashedPassword = await hashPassword(userData.password)
        const createdUser = await prisma.user.create({
            data: { ...userData, password: hashedPassword },
        })

        // Remove password from response
        const userWithoutPassword = omitPassword(createdUser)

        response.status(201).json({
            success: true,
            message: 'User created successfully!',
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

export default signUp
