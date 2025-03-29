import axios from 'axios'
import type { RequestHandler } from 'express'
import { prisma } from '@lib/utils/prismaClient'
import { formatSomaliNumber } from '@lib/formatSomaliNumber'
import { evcPlusAmount } from '@lib/config'
import generateReceiptNumber from '@lib/generateReceiptNumber'

interface EvcPlusPurchaseSchema {
    phoneNumber: string
    userId: string
    propertyId: string
}

const evcPlusPurchase: RequestHandler = async (request, response) => {
    const { phoneNumber, userId, propertyId } = request.body as EvcPlusPurchaseSchema

    // Basic validation
    if (!phoneNumber || !userId || !propertyId) {
        response.status(400).json({
            success: false,
            message: 'Missing required fields: phoneNumber, userId, propertyId',
        })
        return
    }

    const formattedPhone = formatSomaliNumber(phoneNumber)
    const receiptNumber = await generateReceiptNumber()

    try {
        // Verify property exists
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

        // Verify user exists
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

        // Prepare WaafiPay EVC Plus payload
        const payload = {
            schemaVersion: '1.0',
            requestId: receiptNumber.toString(),
            timestamp: new Date().toISOString(),
            channelName: 'WEB',
            serviceName: 'API_PURCHASE',
            serviceParams: {
                merchantUid: process.env.WAAFI_MERCHANT_UID,
                apiUserId: process.env.WAAFI_API_USER_ID,
                apiKey: process.env.WAAFI_API_KEY,
                paymentMethod: 'EVCPLUS',
                payerInfo: {
                    accountNo: formattedPhone,
                },
                transactionInfo: {
                    referenceId: receiptNumber.toString(),
                    invoiceId: receiptNumber.toString(),
                    amount: evcPlusAmount.toString(),
                    currency: 'USD',
                    description: 'Payment for Property Listing',
                },
            },
        }

        // Make request to WaafiPay API
        const waafiResponse = await axios.post(
            process.env.WAAFI_API_ENDPOINT || 'https://api.waafipay.net/asm',
            payload,
            {
                headers: {
                    'Content-Type': 'application/json',
                },
            },
        )

        const responseData = waafiResponse.data

        // Check if payment was initiated successfully
        if (responseData.responseCode !== '2001') {
            // 2001 is success code in WaafiPay
            throw new Error(responseData.responseMsg || 'Failed to initiate EVC Plus payment')
        }

        // Store the transaction in DB with a PENDING status
        await prisma.payment.create({
            data: {
                transactionId: responseData.params.transactionId,
                amount: evcPlusAmount,
                phoneNumber: formattedPhone,
                paymentStatus: 'PENDING',
                transactionDate: new Date(),
                receiptNumber: receiptNumber.toString(),
                paymentMethod: 'EVC',
                user: { connect: { id: userId } },
                property: { connect: { id: propertyId } },
            },
        })

        response.status(201).json({
            success: true,
            data: responseData,
        })
    } catch (error) {
        response.status(500).json({
            success: false,
            message: `Failed to make EVC Plus payment: ${(error as Error).message}`,
        })
    }
}

export { evcPlusPurchase }
