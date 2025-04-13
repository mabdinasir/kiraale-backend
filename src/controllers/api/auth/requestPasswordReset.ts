import { resetPasswordTemplate } from '@lib/emailTemplates/resetPasswordTemplate'
import { generateJwtToken } from '@lib/generateJwtToken'
import { sendEmail } from '@lib/utils/nodeMailer'
import { prisma } from '@lib/utils/prismaClient'
import type { RequestHandler } from 'express'
import { z } from 'zod'

const requestPasswordReset: RequestHandler = async (req, res) => {
    if (!req.body.email) {
        res.status(400).json({ success: false, message: 'Email is required' })
        return
    }

    const emailSchema = z.object({
        email: z.string().email(),
    })
    const validationResult = emailSchema.safeParse(req.body)

    if (!validationResult.success) {
        res.status(400).json({
            success: false,
            message: 'Validation failed',
            errors: validationResult.error.errors.map((err) => ({
                path: err.path,
                message: err.message,
            })),
        })
        return
    }

    const { email } = validationResult.data

    const user = await prisma.user.findUnique({ where: { email } })

    // Respond success even if user doesn't exist to avoid leaking valid emails
    if (!user) {
        res.json({ success: true, message: 'If the email exists, a reset link was sent.' })
        return
    }

    const token = generateJwtToken(user)
    const expiry = new Date(Date.now() + 1000 * 60 * 15)

    await prisma.resetToken.create({
        data: {
            userId: user.id,
            token,
            expiresAt: expiry,
        },
    })

    const resetUrl = `https://kiraale.com/auth/reset-password?token=${token}`
    // const resetUrl = `http://localhost:3000/auth/reset-password?token=${token}`

    const template = resetPasswordTemplate(resetUrl, user.firstName)
    await sendEmail(
        `"Kiraale Support" <${process.env.NODE_MAILER_EMAIL}>`,
        user.email,
        template.subject,
        template.text,
        template.html,
    )
    res.json({ success: true, message: 'If the email exists, a reset link was sent.' })
}

export default requestPasswordReset
