import bcrypt from 'bcryptjs'
import type { Response } from 'express'

const saltRounds = 12

const hashPassword = async (password: string): Promise<string> => {
    try {
        const hashedPassword = await bcrypt.hash(password, saltRounds)
        return hashedPassword
    } catch (error) {
        const err = error as Error
        throw new Error('Failed to hash the password: ' + err.message)
    }
}

const verifyPassword = async (password: string, hashedPassword: string, response: Response): Promise<boolean> => {
    try {
        const isPasswordValid = await bcrypt.compare(password, hashedPassword)
        if (!isPasswordValid) {
            response.status(401).json({
                success: false,
                message: 'Wrong email and password combination!',
            })
            return false
        }
        return isPasswordValid
    } catch (error) {
        const err = error as Error
        throw new Error('Failed to verify the password: ' + err.message)
    }
}

export { hashPassword, verifyPassword }
