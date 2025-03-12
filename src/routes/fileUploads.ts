import uploadProfilePic from '@controllers/api/fileUploads/uploadProfilePic'
import uploadProperties from '@controllers/api/fileUploads/uploadProperties'
import { authMiddleware } from '@middleware/authMiddleware'
import type { RouteGroup } from '@models/routes'

const fileUploadsRoutes: RouteGroup = {
    basePath: '/fileUploads',
    routes: [
        {
            path: '/uploadProfilePic',
            method: 'post',
            middlewares: [authMiddleware],
            handler: uploadProfilePic,
        },
        {
            path: '/uploadProperties',
            method: 'post',
            middlewares: [authMiddleware],
            handler: uploadProperties,
        },
    ],
}

export default fileUploadsRoutes
