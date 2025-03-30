import type { RequestHandler } from 'express'
import { S3Client, PutObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3'
import { getSignedUrl } from '@aws-sdk/s3-request-presigner'
import { prisma } from '@lib/utils/prismaClient'
import computeSHA256 from '@lib/utils/computeSHA256'
import { z } from 'zod'
import { profilePicUploadSchema } from '@schemas/fileUpload.schema'
import multer from 'multer'

// Multer setup for in-memory storage
const upload = multer({ storage: multer.memoryStorage() })

const uploadProfilePic: RequestHandler = async (request, response) => {
    const userId = request.user?.id
    if (!userId) {
        response.status(401).json({ success: false, message: 'Unauthorized, please sign in first!' })
        return
    }

    const file = request.file
    if (!file) {
        response.status(400).json({ success: false, message: 'No file uploaded' })
        return
    }

    try {
        // Compute file checksum
        const checksum = await computeSHA256(file)

        // Validate file details using Zod
        const validatedData = profilePicUploadSchema.parse({
            fileType: file.mimetype,
            fileSize: file.size,
            checksum,
        })

        // Initialize S3 client
        const s3Client = new S3Client({
            region: process.env.AWS_BUCKET_REGION,
            credentials: {
                accessKeyId: process.env.PROFILE_PIC_ACCESS_KEY_ID!,
                secretAccessKey: process.env.PROFILE_PIC_SECRET_ACCESS_KEY!,
            },
        })

        // Generate unique filename
        const fileName = `${validatedData.checksum}-${Date.now()}`

        // Check if the user already has a profile picture and delete it from S3 if exists
        const user = await prisma.user.findUnique({
            where: { id: userId },
            select: { profilePicture: true },
        })

        if (user?.profilePicture) {
            // Delete the previous profile picture from the S3 bucket
            const deleteCommand = new DeleteObjectCommand({
                Bucket: process.env.PROFILE_PIC_BUCKET_NAME!,
                Key: user.profilePicture.split('/').pop()!, // Extract the file name from the URL
            })

            await s3Client.send(deleteCommand)
        }

        // Create S3 upload command
        const putCommand = new PutObjectCommand({
            Bucket: process.env.PROFILE_PIC_BUCKET_NAME!,
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
            response.status(500).json({ success: false, message: 'S3 upload failed' })
            return
        }

        // Get permanent URL
        const mediaUrl = signedUrl.split('?')[0]

        // Update user profile with new profile picture URL
        await prisma.user.update({
            where: { id: userId },
            data: { profilePicture: mediaUrl },
        })

        response.status(200).json({ success: true, profilePicture: mediaUrl })
    } catch (error) {
        if (error instanceof z.ZodError) {
            response.status(400).json({ success: false, error: 'Validation failed', details: error.errors })
            return
        }

        response.status(500).json({ success: false, error: `Internal error occurred: ${(error as Error).message}` })
    }
}

export default [upload.single('file'), uploadProfilePic]
