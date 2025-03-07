import axios from 'axios'
import { timestamp } from '@utils/timeStamp'
import type { RequestHandler } from 'express'
import { StkPushSchema } from '@schemas/index'
import dotenv from 'dotenv'

dotenv.config()

const handleStkPush: RequestHandler = async (request, response) => {
    const { phone, amount } = request.body

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

    const payload = {
        BusinessShortCode: BUSINESS_SHORT_CODE,
        Password: password,
        Timestamp: timestamp,
        TransactionType: 'CustomerPayBillOnline',
        Amount: amount,
        PartyA: phone,
        PartyB: process.env.MPESA_BUSINESS_SHORT_CODE,
        PhoneNumber: phone,
        CallBackURL: 'https://mydomain.com/path',
        AccountReference: 'Eastleigh Real Estate',
        TransactionDesc: 'Payment for Property Listing',
    }

    try {
        const res = await axios.post('https://sandbox.safaricom.co.ke/mpesa/stkpush/v1/processrequest', payload, {
            headers: {
                Authorization: `Bearer ${request.token}`,
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
