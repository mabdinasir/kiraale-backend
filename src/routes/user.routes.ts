import getUserById from '@controllers/api/user/getUserById'
import updateProfile from '@controllers/api/user/updateProfile'
import type { RouteGroup } from '@models/routes'
import { authMiddleware } from 'middleware/authMiddleware'

const userRoutes: RouteGroup = {
    basePath: '/users',
    routes: [
        {
            path: '/getUserById/:id',
            method: 'get',
            middlewares: [authMiddleware],
            handler: getUserById,
        },
        {
            path: '/updateProfile/:id',
            method: 'put',
            middlewares: [authMiddleware],
            handler: updateProfile,
        },
    ],
}

export default userRoutes
