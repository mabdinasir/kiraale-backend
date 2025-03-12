import { z } from 'zod'

const profileSchema = z.object({
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
    profilePicture: z.string().optional(),
})

export { profileSchema }
