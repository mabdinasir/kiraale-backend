// src/cron/expireProperties.ts
import cron from 'node-cron'
import { prisma } from '../prismaClient'

export const setupPropertyExpirationCron = () => {
    // Run daily at midnight
    cron.schedule('0 0 * * *', async () => {
        try {
            await prisma.property.updateMany({
                where: {
                    expiresAt: {
                        lte: new Date(), // Properties where expiresAt <= now
                    },
                    status: {
                        not: 'EXPIRED',
                    },
                },
                data: {
                    status: 'EXPIRED',
                },
            })
        } catch (error) {
            if (error instanceof Error) {
                throw new Error(`Property expiration failed: ${error.message}`)
            } else {
                throw new Error('Property expiration failed with an unknown error')
            }
        }
    })
}
