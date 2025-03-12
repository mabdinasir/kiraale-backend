import { z } from 'zod'
import { allowedFileTypes, allowedImageTypes, maxFileSize } from '@config/index'

// Zod schema for the incoming profile picture upload
export const profilePicUploadSchema = z.object({
    fileType: z.string().refine((type) => allowedImageTypes.includes(type), {
        message: 'Invalid file type',
    }),
    fileSize: z.number().max(maxFileSize, {
        message: `File size exceeds the maximum allowed size of ${maxFileSize / (1024 * 1024)}MB`,
    }),
    checksum: z.string().min(1, {
        message: 'Checksum is required',
    }),
})

// Zod schema for the incoming property upload
export const propertyUploadSchema = z.object({
    fileType: z.string().refine((type) => allowedFileTypes.includes(type), {
        message: 'Invalid file type',
    }),
    fileSize: z.number().max(maxFileSize, {
        message: `File size exceeds the maximum allowed size of ${maxFileSize / (1024 * 1024)}MB`,
    }),
    checksum: z.string().min(1, {
        message: 'Checksum is required',
    }),
    propertyId: z.string().min(1, {
        message: 'Property ID is required',
    }),
})
