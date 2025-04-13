import cron from 'node-cron'
import { cleanupExpiredTokens } from '../utils/tokenCleanup'

// Run daily at 2 AM
export const setupTokenCleanupCron = () => {
    cron.schedule('0 2 * * *', async () => {
        try {
            await cleanupExpiredTokens()
        } catch (error) {
            throw new Error(`Failed to clean up expired tokens: ${(error as Error).message}`)
        }
    })
}
