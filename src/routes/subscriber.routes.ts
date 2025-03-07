import type { RouteGroup } from '@models/routes'
import addSubscriber from '@controllers/api/subscribers/addSubscriber'
import deleteSubscriber from '@controllers/api/subscribers/deleteSubscriber'

const subscriberRoutes: RouteGroup = {
    basePath: '/subscriber',
    routes: [
        {
            path: '/addSubscriber',
            method: 'post',
            handler: addSubscriber,
        },
        {
            path: '/deleteSubscriber/:email',
            method: 'delete',
            handler: deleteSubscriber,
        },
    ],
}

export default subscriberRoutes
