import { z } from 'zod'

export const profileSchema = z.object({
    firstName: z.string().min(2, 'First name must be at least 2 characters'),
    lastName: z.string().min(2, 'Last name must be at least 2 characters'),
    email: z.string().email('Invalid email format'),
    mobile: z.string().min(10, 'Mobile number must be at least 10 digits'),
    address: z.string().min(3, 'Address must be at least 3 characters').optional(),
    bio: z.string().optional(),
    passportNumber: z.string().optional(),
    nationalIdNumber: z.string().optional(),
    agencyName: z.string().optional(),
    yearsOfExperience: z.number().min(0, 'Experience cannot be a negative number').optional(),
})

export const passwordSchema = z
    .object({
        oldPassword: z.string().min(8, 'Old password is required and must be at least 8 characters'),
        newPassword: z.string().min(8, 'New password must be at least 8 characters'),
        confirmNewPassword: z.string().min(8, 'Please confirm your new password'),
    })
    .refine((data) => data.newPassword === data.confirmNewPassword, {
        message: 'New passwords do not match',
        path: ['confirmNewPassword'],
    })
