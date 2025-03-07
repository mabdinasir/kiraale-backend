import jwt from 'jsonwebtoken'
import type { User } from '@prisma/client'
import type { JwtPayload } from '@models/jwtPayload'
import { omitPassword } from './utils/omitPassword'

const SECRET = process.env.JWT_SECRET

if (!SECRET) {
    throw new Error('JWT_SECRET environment variable is not set')
}

export const generateJwtToken = (user: User): string => {
    const userWithoutPassword = omitPassword(user)
    const payload: JwtPayload = { ...userWithoutPassword }

    return jwt.sign(payload, SECRET, { expiresIn: '30d', algorithm: 'HS512' })
}

export const verifyJwtToken = (token: string): JwtPayload =>
    jwt.verify(token, SECRET, { algorithms: ['HS512'] }) as JwtPayload
