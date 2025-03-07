/* eslint-disable callback-return */
/* eslint-disable require-atomic-updates */
import type { RequestHandler } from 'express'
import { verifyJwtToken } from '@lib/generateJwtToken'
import { prisma } from '@lib/utils/prismaClient'
import { authorizationSchema } from '@schemas/index'
import jwt from 'jsonwebtoken'
import { z } from 'zod'
import dotenv from 'dotenv'

dotenv.config()

export const authMiddleware: RequestHandler = async (request, response, next) => {
    try {
        const JWT_SECRET = process.env.JWT_SECRET

        if (!JWT_SECRET) {
            response.status(500).json({ success: false, message: 'Server configuration error' })
            return
        }

        // Validate authorization header structure
        const authorizationHeader = authorizationSchema.parse(request.headers.authorization)
        const token = authorizationHeader.split(' ')[1]

        if (!token) {
            response.status(401).json({ success: false, message: 'Authorization token missing' })
            return
        }

        // Verify token validity
        const decoded = verifyJwtToken(token)

        // Check if user exists
        const isExistingUser = await prisma.user.findUnique({ where: { email: decoded.email } })
        if (!isExistingUser) {
            response.status(404).json({ success: false, message: 'User not found' })
            return
        }

        // const isSignedIn = await prisma.user.findUnique({
        //     where: { email: decoded.email },
        //     select: { isSignedIn: true },
        // })
        // if (!isSignedIn?.isSignedIn) {
        //     response.status(401).json({ success: false, message: 'Unauthorized: User is not signed in!' })
        //     return
        // }

        // Check token blacklist
        const blacklistedToken = await prisma.tokenBlacklist.findUnique({ where: { token } })
        if (blacklistedToken) {
            response.status(401).json({ success: false, message: 'Token revoked' })
            return
        }

        // Attach user context to request
        request.user = decoded
        request.token = token
        next()
    } catch (error) {
        if (error instanceof jwt.TokenExpiredError) {
            response.status(401).json({ success: false, message: 'Session expired' })
            return
        }

        if (error instanceof jwt.JsonWebTokenError) {
            response.status(401).json({ success: false, message: 'Invalid session' })
            return
        }

        if (error instanceof z.ZodError) {
            response.status(400).json({
                success: false,
                message: 'Invalid authorization header',
                errors: error.errors.map((err) => ({
                    field: err.path.join('.'),
                    message: err.message,
                })),
            })
            return
        }

        response.status(500).json({ success: false, message: `Internal server error: ${(error as Error).message}` })
    }
}
