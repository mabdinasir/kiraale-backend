import type { User } from '@prisma/client'
import { omit } from 'lodash'

export const omitPassword = (user: User) => {
    const userWithoutPassword = omit(user, ['password'])
    return userWithoutPassword
}
