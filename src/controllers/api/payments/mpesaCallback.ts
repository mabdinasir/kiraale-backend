import { Request, Response } from 'express'
import { StkPushCallbackSchema } from '@schemas/payment.schema'
import { prisma } from '@lib/utils/prismaClient'

const handleMpesaCallback = async (req: Request, res: Response) => {
    try {
        const validationResult = StkPushCallbackSchema.safeParse(req.body)

        if (!validationResult.success) {
            res.status(400).json({
                success: false,
                message: 'Invalid callback format',
                errors: validationResult.error.errors,
            })
            return
        }

        const { Body } = validationResult.data
        const callback = Body.stkCallback
        const transactionId = callback.CheckoutRequestID

        const payment = await prisma.payment.findUnique({
            where: { transactionId },
        })

        if (!payment) {
            res.status(404).json({
                success: false,
                message: 'Payment record not found',
            })
            return
        }

        const paymentStatus = callback.ResultCode === 0 ? 'COMPLETED' : 'FAILED'

        await prisma.payment.update({
            where: { transactionId },
            data: {
                paymentStatus,
                ...(callback.ResultCode === 0 && {
                    transactionDate: new Date(),
                }),
            },
        })

        res.status(200).json({ success: true, message: 'Callback processed successfully' })
    } catch {
        res.status(500).json({
            success: false,
            message: 'Internal server error processing callback',
        })
    }
}

export default handleMpesaCallback
