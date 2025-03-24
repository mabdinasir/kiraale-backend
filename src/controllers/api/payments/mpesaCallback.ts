import { Request, Response } from 'express'
import { StkPushCallbackSchema } from '@schemas/payment.schema'
import { prisma } from '@lib/utils/prismaClient'

const handleMpesaCallback = async (req: Request, res: Response) => {
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

    await prisma.payment.update({
        where: { transactionId },
        data: {
            paymentStatus: callback.ResultCode === 0 ? 'COMPLETED' : 'FAILED',
        },
    })

    res.status(200).json({ message: 'Callback processed successfully' })
}

export default handleMpesaCallback
