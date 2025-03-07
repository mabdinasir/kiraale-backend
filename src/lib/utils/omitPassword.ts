import type { User } from '@prisma/client'
import lodash from 'lodash'

export const omitPassword = (user: User) => {
    const userWithoutPassword = lodash.omit(user, ['password'])
    return userWithoutPassword
}
