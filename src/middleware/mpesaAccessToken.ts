import axios from 'axios'
import type { NextFunction, Request, Response } from 'express'

export type RequestExtended = Request & { token?: string }

export const mpesaAccessToken = async (req: RequestExtended, res: Response, next: NextFunction) => {
    const CONSUMER_KEY = process.env.MPESA_CONSUMER_KEY as string
    const CONSUMER_SECRET = process.env.MPESA_CONSUMER_SECRET as string
    const URL = 'https://sandbox.safaricom.co.ke/oauth/v1/generate?grant_type=client_credentials'

    const auth = Buffer.from(`${CONSUMER_KEY}:${CONSUMER_SECRET}`).toString('base64')

    try {
        const response = await axios(URL, {
            headers: {
                Authorization: `Basic ${auth}`,
            },
        })
        req.token = response.data.access_token
        // eslint-disable-next-line callback-return
        next()
    } catch (error) {
        res.status(500).json({
            success: false,
            message: `Failed to generate access token: ${(error as Error).message}`,
        })
    }
}
