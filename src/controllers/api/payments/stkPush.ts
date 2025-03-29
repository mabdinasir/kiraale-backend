import axios from 'axios'
import { timestamp } from '@utils/timeStamp'
import type { RequestHandler } from 'express'
import { StkPushSchema } from '@schemas/index'
import dotenv from 'dotenv'
import { formatKenyanNumber } from '@lib/formatKenyanNumber'
import { mpesaAmount } from '@lib/config'
import { prisma } from '@lib/utils/prismaClient'
import generateReceiptNumber from '@lib/generateReceiptNumber'
dotenv.config()

const handleStkPush: RequestHandler = async (request, response) => {
    const { phoneNumber, userId, propertyId } = request.body

    const validationResult = StkPushSchema.safeParse(request.body)
    if (!validationResult.success) {
        response.status(400).json({
            success: false,
            message: `Validation errors: ${validationResult.error.errors.map((err) => err.message).join(', ')}`,
        })
        return
    }

    const BUSINESS_SHORT_CODE = process.env.MPESA_BUSINESS_SHORT_CODE as string

    const password = Buffer.from(BUSINESS_SHORT_CODE + process.env.MPESA_PASSKEY + timestamp).toString('base64')
    const formattedPhone = formatKenyanNumber(phoneNumber)
    const receiptNumber = await generateReceiptNumber()

    const payload = {
        BusinessShortCode: BUSINESS_SHORT_CODE,
        Password: password,
        Timestamp: timestamp,
        TransactionType: 'CustomerPayBillOnline',
        Amount: mpesaAmount,
        PartyA: formattedPhone,
        PartyB: process.env.MPESA_BUSINESS_SHORT_CODE,
        PhoneNumber: formattedPhone,
        CallBackURL: 'https://mydomain.com/path',
        AccountReference: 'Kiraale',
        TransactionDesc: 'Payment for Property Listing',
    }

    try {
        const property = await prisma.property.findUnique({
            where: { id: propertyId },
        })

        if (!property) {
            response.status(404).json({
                success: false,
                message: 'Property not found, cannot proceed with payment',
            })
            return
        }

        const user = await prisma.user.findUnique({
            where: { id: userId },
        })

        if (!user) {
            response.status(404).json({
                success: false,
                message: 'Cannot proceed with payment. User not found in the database',
            })
            return
        }

        const res = await axios.post('https://sandbox.safaricom.co.ke/mpesa/stkpush/v1/processrequest', payload, {
            headers: {
                Authorization: `Bearer ${request.token}`,
            },
        })

        const { CheckoutRequestID } = await res.data

        // Store the transaction in DB with a PENDING status
        await prisma.payment.create({
            data: {
                transactionId: CheckoutRequestID,
                amount: mpesaAmount,
                phoneNumber: formattedPhone,
                paymentStatus: 'PENDING',
                transactionDate: new Date(),
                receiptNumber: receiptNumber.toString(),
                paymentMethod: 'MPESA',
                user: { connect: { id: userId } },
                property: { connect: { id: propertyId } },
            },
        })

        response.status(201).json({
            success: true,
            data: res.data,
        })
    } catch (error) {
        response.status(500).json({
            success: false,
            message: `Failed to make payment: ${(error as Error).message}`,
        })
    }
}

export { handleStkPush }
