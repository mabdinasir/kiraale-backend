import deletePropertyMedia from '@controllers/api/fileUploads/deletePropertyMedia'
import uploadProfilePic from '@controllers/api/fileUploads/uploadProfilePic'
import uploadPropertyMedia from '@controllers/api/fileUploads/uploadPropertyMedia'
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
            path: '/uploadPropertyMedia',
            method: 'post',
            middlewares: [authMiddleware],
            handler: uploadPropertyMedia,
        },
        {
            path: '/deletePropertyMedia',
            method: 'delete',
            middlewares: [authMiddleware],
            handler: deletePropertyMedia,
        },
    ],
}

export default fileUploadsRoutes
