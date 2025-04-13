import { z } from 'zod'

// Base reusable schemas
export const emailSchema = z.string().email('Invalid email format').min(1, 'Email is required')

export const passwordSchema = z
    .string()
    .min(1, 'Password is required')
    .min(8, 'Password must be at least 8 characters')
    .regex(
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/,
        'Password must contain at least one uppercase, lowercase, number, and special character',
    )

export const mobileSchema = z
    .string()
    .min(1, 'Mobile number is required')
    .refine((value) => value.length >= 10 && value.length <= 15, 'Mobile number must be between 10 and 15 characters')

// Composite schemas
export const loginSchema = z
    .object({
        email: emailSchema,
        password: passwordSchema,
    })
    .strict()

export const signUpSchema = z
    .object({
        email: emailSchema,
        password: passwordSchema,
        firstName: z.string().min(1, 'First name is required').max(50, 'First name cannot exceed 50 characters'),
        lastName: z.string().min(1, 'Last name is required').max(50, 'Last name cannot exceed 50 characters'),
        mobile: mobileSchema,
        hasAcceptedTnC: z.boolean().refine((val) => val === true, 'You must accept the Terms and Conditions'),
    })
    .strict()

export const authorizationSchema = z.string().regex(/^Bearer .+$/, 'Invalid authorization header format')

export const resetPasswordSchema = z
    .object({
        token: z.string().min(1, 'Reset token is required'),
        newPassword: passwordSchema,
        confirmPassword: passwordSchema,
    })
    .refine((data) => data.newPassword === data.confirmPassword, {
        message: "Passwords don't match",
        path: ['confirmPassword'],
    })
