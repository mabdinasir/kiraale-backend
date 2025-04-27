import { prisma } from '@lib/prismaClient'
import type { RequestHandler } from 'express'

const checkMpesaPaymentStatus: RequestHandler = async (req, res) => {
    const { transactionId } = req.params

    if (!transactionId) {
        res.status(400).json({ success: false, message: 'Transaction ID is required' })
        return
    }

    const payment = await prisma.payment.findUnique({
        where: { transactionId },
    })

    if (!payment) {
        res.status(404).json({ success: false, message: 'Payment not found' })
        return
    }

    res.status(200).json({
        success: true,
        data: {
            transactionId: payment.transactionId,
            paymentStatus: payment.paymentStatus,
            amountPaid: payment.amount,
            receiptNumber: payment.receiptNumber,
            transactionDate: payment.transactionDate,
            phoneNumber: payment.phoneNumber,
            paymentMethod: payment.paymentMethod,
        },
    })
}

export default checkMpesaPaymentStatus
