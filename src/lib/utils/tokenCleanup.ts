import { prisma } from './prismaClient'

export const cleanupExpiredTokens = async () => {
    // Calculate date 30 days ago
    const thirtyDaysAgo = new Date()
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

    // Delete tokens created more than 30 days ago
    await prisma.tokenBlacklist.deleteMany({
        where: {
            createdAt: {
                lt: thirtyDaysAgo,
            },
        },
    })
}
