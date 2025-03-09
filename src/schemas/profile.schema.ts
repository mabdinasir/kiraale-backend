import { z } from 'zod'

export const profileSchema = z.object({
    firstName: z.string().optional(),
    lastName: z.string().optional(),
    mobile: z.string(),
    email: z.string().email(),
    profilePicture: z.string().url().nullable().optional(),
    bio: z.string().max(500).nullable().optional(),
    address: z.string().nullable().optional(),
    agencyName: z.string().nullable().optional(),
    yearsOfExperience: z.number().int().min(0).nullable().optional(),
    nationalIdNumber: z.string().nullable().optional(),
    passportNumber: z.string().nullable().optional(),
})
