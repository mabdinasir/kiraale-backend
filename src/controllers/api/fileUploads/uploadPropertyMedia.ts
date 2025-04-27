import type { RequestHandler } from 'express'
import { PutObjectCommand, S3Client } from '@aws-sdk/client-s3'
import { getSignedUrl } from '@aws-sdk/s3-request-presigner'
import { prisma } from '@lib/prismaClient'
import computeSHA256 from '@lib/utils/crypto/computeSHA256'
import { z } from 'zod'
import { propertyUploadSchema } from '@schemas/fileUpload.schema'
import multer from 'multer'

// Multer setup for in-memory storage
const upload = multer({ storage: multer.memoryStorage() })

const uploadProperties: RequestHandler = async (request, response) => {
    const userId = request.user?.id
    if (!userId) {
        response.status(401).json({ success: false, message: 'Unauthorized, please sign in first!' })
        return
    }

    const files = request.files as Express.Multer.File[]
    const propertyId = request.body.propertyId

    if (!files || files.length === 0) {
        response.status(400).json({ success: false, message: 'At least 1 file must be uploaded' })
        return
    }

    if (!propertyId) {
        response.status(400).json({ success: false, message: 'Property ID is required' })
        return
    }

    try {
        // Check if this is the first upload
        const existingMediaCount = await prisma.media.count({
            where: { propertyId },
        })

        const isFirstUpload = existingMediaCount === 0

        if (isFirstUpload && files.length < 4) {
            response.status(400).json({
                success: false,
                message: 'First-time uploads must include at least 4 images',
            })
            return
        }

        if (!isFirstUpload && files.length < 1) {
            response.status(400).json({
                success: false,
                message: 'At least one image is required to add more media',
            })
            return
        }

        // Initialize S3 client
        const s3Client = new S3Client({
            region: process.env.AWS_BUCKET_REGION,
            credentials: {
                accessKeyId: process.env.PROPERTIES_ACCESS_KEY_ID!,
                secretAccessKey: process.env.PROPERTIES_SECRET_ACCESS_KEY!,
            },
        })

        const uploadedUrls: string[] = []

        const uploadPromises = files.map(async (file) => {
            const checksum = await computeSHA256(file)

            const validatedData = propertyUploadSchema.parse({
                fileType: file.mimetype,
                fileSize: file.size,
                checksum,
                propertyId,
            })

            const fileName = `${validatedData.checksum}-${Date.now()}`

            const putCommand = new PutObjectCommand({
                Bucket: process.env.PROPERTIES_BUCKET_NAME!,
                Key: fileName,
                ContentType: file.mimetype,
                ContentLength: file.size,
                Metadata: {
                    checksum: validatedData.checksum,
                    userId: userId || '',
                },
            })

            const signedUrl = await getSignedUrl(s3Client, putCommand, { expiresIn: 3600 })

            const uploadResponse = await fetch(signedUrl, {
                method: 'PUT',
                body: file.buffer,
                headers: { 'Content-Type': file.mimetype },
            })

            if (!uploadResponse.ok) {
                throw new Error('S3 upload failed')
            }

            const mediaUrl = signedUrl.split('?')[0]
            uploadedUrls.push(mediaUrl)

            await prisma.media.create({
                data: {
                    url: mediaUrl,
                    type: file.mimetype === 'video/mp4' ? 'VIDEO' : 'IMAGE',
                    uploadedBy: userId,
                    property: {
                        connect: { id: propertyId },
                    },
                },
            })
        })

        await Promise.all(uploadPromises)

        response.status(200).json({
            success: true,
            propertyPictures: uploadedUrls,
            isFirstUpload,
            totalMediaCount: existingMediaCount + uploadedUrls.length,
        })
    } catch (error) {
        if (error instanceof z.ZodError) {
            response.status(400).json({
                success: false,
                error: 'Validation failed',
                details: error.errors,
            })
        }

        response.status(500).json({
            success: false,
            error: `Internal error occurred: ${(error as Error).message}`,
        })
    }
}

export default [upload.array('file', 10), uploadProperties]
