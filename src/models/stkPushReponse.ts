export interface StkPushResponse {
    success: boolean
    data: {
        MerchantRequestID: string
        CheckoutRequestID: string
        ResponseCode: string
        ResponseDescription: string
        CustomerMessage: string
    }
}
