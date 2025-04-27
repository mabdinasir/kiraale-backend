import type { RequestHandler } from 'express'
import { authorizationSchema } from '@schemas/index'
import { verifyJwtToken } from '@lib/utils/auth/generateJwtToken'

export const tokenExtractionMiddleware: RequestHandler = (request, response, next) => {
    try {
        // Check if the Authorization header exists
        if (!request.headers.authorization) {
            request.token = undefined
            return next()
        }

        // Validate the Authorization header structure
        const authorizationHeader = authorizationSchema.parse(request.headers.authorization)
        const token = authorizationHeader.split(' ')[1]

        const decodedUser = verifyJwtToken(token)

        // Attach the token and decoded information to the request object
        request.token = token
        request.user = decodedUser
        return next()
    } catch {
        // If the Authorization header is invalid, proceed without a token
        request.token = undefined
        return next()
    }
}
