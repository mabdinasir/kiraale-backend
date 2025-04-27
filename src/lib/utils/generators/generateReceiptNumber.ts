import { prisma } from '../../prismaClient'

const generateReceiptNumber = async (): Promise<string> => {
    const lastPayment = await prisma.payment.findFirst({
        where: { paymentStatus: 'COMPLETED' },
        orderBy: { createdAt: 'desc' },
        select: { receiptNumber: true },
    })

    let nextNumber = 1

    if (lastPayment?.receiptNumber) {
        const lastNumber = parseInt(lastPayment.receiptNumber, 10)
        nextNumber = lastNumber + 1
    }

    return String(nextNumber).padStart(3, '0')
}

export default generateReceiptNumber
