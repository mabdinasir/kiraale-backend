import type { RouteGroup } from '@models/routes'
import { handleStkPush } from '@controllers/api/payments/stkPush'
import { mpesaAccessToken } from 'middleware/mpesaAccessToken'

const paymentRoutes: RouteGroup = {
    basePath: '/payment',
    routes: [
        {
            path: '/stkPush',
            method: 'post',
            middlewares: [mpesaAccessToken],
            handler: handleStkPush,
        },
    ],
}

export default paymentRoutes
