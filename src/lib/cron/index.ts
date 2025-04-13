import { setupPropertyExpirationCron } from './expireProperties'
import { setupTokenCleanupCron } from './tokenCleanup'

export const setupCrons = () => {
    setupTokenCleanupCron()
    setupPropertyExpirationCron()
}
