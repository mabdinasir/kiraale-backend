interface PaymentDetails {
    amount: string | number
}

export const paymentConfirmationTemplate = (paymentDetails: PaymentDetails) => ({
    subject: 'Payment Confirmation',
    text: `Your payment of ${paymentDetails.amount} was received.`,
    html: `
    <!DOCTYPE html>
    <html>
    <body>
        <h2>Payment Received</h2>
        <p>Thank you for your payment of ${paymentDetails.amount}.</p>
    </body>
    </html>
    `,
})
