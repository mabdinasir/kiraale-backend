import { prisma } from '@lib/utils/prismaClient'
import type { RequestHandler } from 'express'
import { z } from 'zod'

const paramsSchema = z.object({
    propertyId: z.string().uuid(),
})

const getPaymentByPropertyId: RequestHandler = async (request, response) => {
    const { propertyId } = request.params

    const validationResult = paramsSchema.safeParse({ propertyId })
    if (!validationResult.success) {
        response.status(400).json({
            success: false,
            message: 'Invalid property ID.',
        })
        return
    }

    try {
        const payment = await prisma.payment.findFirst({
            where: { propertyId },
            include: {
                user: { select: { firstName: true, lastName: true, email: true, mobile: true } },
                property: true,
            },
        })

        if (!payment) {
            response.status(404).json({ success: false, message: 'Payment not found for this property.' })
            return
        }

        response.status(200).json({
            message: 'Payment data retrieved successfully.',
            success: true,
            payment,
        })
    } catch (error) {
        response.status(500).json({
            success: false,
            message: `Internal error occurred: ${(error as Error).message}`,
        })
    }
}

export default getPaymentByPropertyId
