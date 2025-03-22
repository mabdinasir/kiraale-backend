import { User } from '@prisma/client'

export interface JwtPayload extends Omit<User, 'password'> {
    iat?: number
    exp?: number
}
