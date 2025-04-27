import type { RequestHandler } from 'express'
import { DeleteObjectCommand, S3Client } from '@aws-sdk/client-s3'
import { prisma } from '@lib/prismaClient'
import { z } from 'zod'

const s3Client = new S3Client({
    region: process.env.AWS_BUCKET_REGION,
    credentials: {
        accessKeyId: process.env.PROPERTIES_ACCESS_KEY_ID!,
        secretAccessKey: process.env.PROPERTIES_SECRET_ACCESS_KEY!,
    },
})

const deleteMediaSchema = z.object({
    mediaIds: z.array(z.string().uuid()).min(1, 'At least one media ID required'),
    propertyId: z.string().uuid(),
})

const deletePropertyMedia: RequestHandler = async (req, res) => {
    const userId = req.user?.id
    if (!userId) {
        res.status(401).json({ success: false, message: 'Unauthorized, please sign in first!' })
        return
    }

    try {
        const { mediaIds, propertyId } = deleteMediaSchema.parse(req.body)

        const isModerator = req.user?.role === 'MODERATOR'

        // Skip ownership check for moderators
        if (!isModerator) {
            const property = await prisma.property.findUnique({
                where: { id: propertyId },
                select: { userId: true },
            })

            if (!property) {
                res.status(404).json({ success: false, message: 'Property not found' })
                return
            }

            if (property.userId !== userId) {
                res.status(403).json({
                    success: false,
                    message: 'You do not have permission to modify this property',
                })
                return
            }
        }

        const mediaToDelete = await prisma.media.findMany({
            where: {
                id: { in: mediaIds },
                propertyId,
            },
        })

        if (mediaToDelete.length !== mediaIds.length) {
            res.status(400).json({
                success: false,
                message: 'Some media IDs do not belong to this property',
            })
            return
        }

        // Delete operations
        await Promise.all(
            mediaToDelete.map(async (media) => {
                const key = media.url.split('/').pop()
                if (!key) {
                    return
                }

                await s3Client.send(
                    new DeleteObjectCommand({
                        Bucket: process.env.PROPERTIES_BUCKET_NAME!,
                        Key: key,
                    }),
                )

                await prisma.media.delete({ where: { id: media.id } })
            }),
        )

        res.status(200).json({
            success: true,
            message: 'Media deleted successfully',
            deletedCount: mediaToDelete.length,
        })
    } catch (error) {
        if (error instanceof z.ZodError) {
            res.status(400).json({
                success: false,
                error: 'Validation failed',
                details: error.errors,
            })
        }

        res.status(500).json({
            success: false,
            error: `Internal error occurred: ${(error as Error).message}`,
        })
    }
}

export default deletePropertyMedia
