import contact from '@controllers/api/contact'
import type { RouteGroup } from '@models/routes'

const contactRoutes: RouteGroup = {
    basePath: '/contact',
    routes: [
        {
            path: '/',
            method: 'post',
            handler: contact,
        },
    ],
}

export default contactRoutes
