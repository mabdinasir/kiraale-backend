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

    // Look up the payment by transactionId
    const payment = await prisma.payment.findUnique({
        where: { transactionId },
    })

    if (!payment) {
        res.status(404).json({
            success: false,
            message: 'Payment not found',
        })
        return
    }

    if (callback.ResultCode === 0) {
        // Successful payment
        const amount = callback.CallbackMetadata?.Item.find((item) => item.Name === 'Amount')?.Value
        const receiptNumber = callback.CallbackMetadata?.Item.find((item) => item.Name === 'MpesaReceiptNumber')?.Value
        const transactionDate = callback.CallbackMetadata?.Item.find((item) => item.Name === 'TransactionDate')?.Value
        const phoneNumber = callback.CallbackMetadata?.Item.find((item) => item.Name === 'PhoneNumber')?.Value

        // Update the payment status to COMPLETED
        await prisma.payment.update({
            where: { transactionId },
            data: {
                amount: amount ? Number(amount) : undefined,
                receiptNumber: receiptNumber ? String(receiptNumber) : undefined,
                transactionDate: transactionDate ? new Date(transactionDate) : undefined,
                phoneNumber: phoneNumber ? String(phoneNumber) : undefined,
                paymentStatus: 'COMPLETED',
                user: { connect: { id: payment.userId } },
                property: { connect: { id: payment.propertyId } },
            },
        })
    } else {
        // Failed payment
        await prisma.payment.update({
            where: { transactionId },
            data: {
                paymentStatus: 'FAILED',
            },
        })
    }

    res.status(200).json({ message: 'Callback processed successfully' })
}

export default handleMpesaCallback
