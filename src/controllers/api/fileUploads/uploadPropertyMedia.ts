import type { RequestHandler } from 'express'
import { PutObjectCommand, S3Client } from '@aws-sdk/client-s3'
import { getSignedUrl } from '@aws-sdk/s3-request-presigner'
import { prisma } from '@lib/utils/prismaClient'
import computeSHA256 from '@lib/utils/computeSHA256'
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
        response.status(400).json({ success: false, message: 'No files uploaded' })
        return
    }

    if (!propertyId) {
        response.status(400).json({ success: false, message: 'Property ID is required' })
        return
    }

    try {
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
            // Compute file checksum
            const checksum = await computeSHA256(file)

            // Validate file details using Zod schema
            const validatedData = propertyUploadSchema.parse({
                fileType: file.mimetype,
                fileSize: file.size,
                checksum,
                propertyId,
            })

            // Generate unique filename
            const fileName = `${validatedData.checksum}-${Date.now()}`

            // Create S3 upload command
            const putCommand = new PutObjectCommand({
                Bucket: process.env.PROPERTIES_BUCKET_NAME!,
                Key: fileName,
                ContentType: file.mimetype,
                ContentLength: file.size,
                Metadata: { checksum: validatedData.checksum, userId: userId || '' },
            })

            // Generate signed URL
            const signedUrl = await getSignedUrl(s3Client, putCommand, { expiresIn: 3600 })

            // Upload to S3
            const uploadResponse = await fetch(signedUrl, {
                method: 'PUT',
                body: file.buffer,
                headers: { 'Content-Type': file.mimetype },
            })

            if (!uploadResponse.ok) {
                throw new Error('S3 upload failed')
            }

            // Get permanent URL (strip query parameters from the signed URL)
            const mediaUrl = signedUrl.split('?')[0]
            uploadedUrls.push(mediaUrl)

            // Update property record in the database for each file
            await prisma.media.create({
                data: {
                    url: mediaUrl,
                    type: file.mimetype === 'video/mp4' ? 'VIDEO' : 'IMAGE',
                    property: { connect: { id: propertyId } },
                },
            })
        })

        await Promise.all(uploadPromises)

        response.status(200).json({ success: true, propertyPictures: uploadedUrls })
    } catch (error) {
        if (error instanceof z.ZodError) {
            response.status(400).json({ success: false, error: 'Validation failed', details: error.errors })
            return
        }

        response.status(500).json({ success: false, error: `Internal error occurred: ${(error as Error).message}` })
    }
}

export default [upload.array('file', 10), uploadProperties]
