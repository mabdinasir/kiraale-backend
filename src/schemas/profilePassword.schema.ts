import { z } from 'zod'

const profilePasswordSchema = z
    .object({
        oldPassword: z.string().min(8, 'Old password is required and must be at least 8 characters'),
        newPassword: z.string().min(8, 'New password must be at least 8 characters'),
        confirmNewPassword: z.string().min(8, 'Please confirm your new password'),
    })
    .refine((data) => data.newPassword === data.confirmNewPassword, {
        message: 'New passwords do not match',
        path: ['confirmNewPassword'],
    })

export { profilePasswordSchema }
