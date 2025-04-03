import type { RouteGroup } from '@models/routes'
import { handleStkPush } from '@controllers/api/payments/stkPush'
import { mpesaAccessToken } from '@middleware/mpesaAccessToken'
import checkMpesaPaymentStatus from '@controllers/api/payments/checkMpesaPaymentStatus'
import { authMiddleware } from '@middleware/authMiddleware'
import { evcPlusPurchase } from '@controllers/api/payments/evcPlusPurchase'
import handleMpesaCallback from '@controllers/api/payments/mpesaCallback'

const paymentRoutes: RouteGroup = {
    basePath: '/payments',
    routes: [
        {
            path: '/stkPush',
            method: 'post',
            middlewares: [mpesaAccessToken],
            handler: handleStkPush,
        },
        {
            path: '/checkMpesaPaymentStatus/:transactionId',
            method: 'get',
            middlewares: [authMiddleware],
            handler: checkMpesaPaymentStatus,
        },
        {
            path: '/mpesaCallback',
            method: 'post',
            middlewares: [],
            handler: handleMpesaCallback,
        },
        {
            path: '/evcPlusPurchase',
            method: 'post',
            middlewares: [],
            handler: evcPlusPurchase,
        },
    ],
}

export default paymentRoutes
