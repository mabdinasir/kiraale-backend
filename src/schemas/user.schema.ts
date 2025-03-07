import { z } from 'zod'

export const profileSchema = z.object({
    firstName: z.string().optional(),
    lastName: z.string().optional(),
    profilePicture: z.string().url().optional(),
    bio: z.string().max(500).optional(),
    address: z.string().optional(),
    agencyName: z.string().optional(),
    licenseNumber: z.string().optional(),
    yearsOfExperience: z.number().int().min(0).optional(),
    nationalIdNumber: z.string().optional(),
    passportNumber: z.string().optional(),
})
