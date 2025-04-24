import { z } from 'zod'

// Features schema (for the separate features table)
export const propertyFeaturesSchema = z.object({
    bedrooms: z.number().min(0, 'Bedrooms must be a positive number').optional(),
    bathrooms: z.number().min(0, 'Bathrooms must be a positive number').optional(),
    parking: z.number().min(0, 'Parking must be a positive number').optional(),
    area: z.number().min(0, 'Area must be a positive number').optional(),
    yearBuilt: z
        .number()
        .int()
        .min(1900, `Year must be greater than 1900`)
        .max(new Date().getFullYear(), `Year must be less than ${new Date().getFullYear()}`)
        .optional(),
    pool: z.boolean().optional(),
    furnished: z.boolean().optional(),
    dishwasher: z.boolean().optional(),
    airConditioning: z.boolean().optional(),
    laundry: z.boolean().optional(),
    wardrobe: z.boolean().optional(),
    oven: z.boolean().optional(),
})

// Main property schema
export const propertySchema = z.object({
    country: z.enum(['SOMALIA', 'KENYA'], {
        errorMap: () => ({ message: 'Country must be either Somalia or Kenya' }),
    }),
    title: z.string().min(3, 'Title must be at least 3 characters'),
    description: z.string().optional(),
    address: z.string().min(5, 'Address must be at least 5 characters'),
    price: z.number().min(1, 'Price must be a positive number'),
    listingType: z.enum(['SALE', 'RENT'], {
        errorMap: () => ({ message: 'Listing type must be either Sale or Rent' }),
    }),
    propertyType: z.enum(['RESIDENTIAL', 'COMMERCIAL', 'LAND'], {
        errorMap: () => ({ message: 'Property type must be either Residential, Commercial, or Land' }),
    }),
    features: propertyFeaturesSchema.optional(), // Nested features
})

// Search query schema
export const propertySearchQuerySchema = z.object({
    country: z.enum(['SOMALIA', 'KENYA'], {
        errorMap: () => ({ message: 'Country must be either Somalia or Kenya' }),
    }),
    query: z.string().optional(),
    minPrice: z
        .string()
        .optional()
        .transform((val) => (val ? parseFloat(val) : undefined))
        .refine((val) => val === undefined || val >= 0, 'Price must be a positive number'),
    maxPrice: z
        .string()
        .optional()
        .transform((val) => (val ? parseFloat(val) : undefined))
        .refine((val) => val === undefined || val >= 0, 'Price must be a positive number'),
    propertyType: z.enum(['RESIDENTIAL', 'COMMERCIAL', 'LAND']).optional(),
    listingType: z.enum(['SALE', 'RENT']).optional(),
})
