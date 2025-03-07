import addMedia from '@controllers/api/media/addMedia'
import type { RouteGroup } from '@models/routes'
import { authMiddleware } from '@middleware/authMiddleware'

const mediaRoutes: RouteGroup = {
    basePath: '/media',
    routes: [
        {
            path: '/addMedia',
            method: 'post',
            middlewares: [authMiddleware],
            handler: addMedia,
        },
    ],
}

export default mediaRoutes
