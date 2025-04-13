import login from '@controllers/api/auth/login'
import signOut from '@controllers/api/auth/signout'
import signUp from '@controllers/api/auth/signup'
import type { RouteGroup } from '@models/routes'
import { authMiddleware } from '@middleware/authMiddleware'
import requestPasswordReset from '@controllers/api/auth/requestPasswordReset'
import resetPassword from '@controllers/api/auth/resetPassword'

const authRoutes: RouteGroup = {
    basePath: '/auth',
    routes: [
        {
            path: '/signup',
            method: 'post',
            handler: signUp,
        },
        {
            path: '/login',
            method: 'post',
            handler: login,
        },
        {
            path: '/signout',
            method: 'post',
            middlewares: [authMiddleware],
            handler: signOut,
        },
        {
            path: '/request-password-reset',
            method: 'post',
            handler: requestPasswordReset,
        },
        {
            path: '/reset-password',
            method: 'post',
            handler: resetPassword,
        },
    ],
}

export default authRoutes
