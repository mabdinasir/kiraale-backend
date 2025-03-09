import getUserById from '@controllers/api/user/getUserById'
import updateUserProfile from '@controllers/api/user/updateUserProfile'
import type { RouteGroup } from '@models/routes'
import { authMiddleware } from '@middleware/authMiddleware'
import UpdateUserPassword from '@controllers/api/user/UpdateUserPassword'

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
            path: '/updateUserProfile/:id',
            method: 'put',
            middlewares: [authMiddleware],
            handler: updateUserProfile,
        },
        {
            path: '/updateUserPassword/:id',
            method: 'put',
            middlewares: [authMiddleware],
            handler: UpdateUserPassword,
        },
    ],
}

export default userRoutes
