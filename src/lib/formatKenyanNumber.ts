export const formatKenyanNumber = (phone: string): string => {
    const sanitizedPhone = phone.replace(/\s+/g, '')

    if (/^07\d{8}$/.test(sanitizedPhone)) {
        return `254${sanitizedPhone.slice(1)}`
    } else if (/^\+2547\d{8}$/.test(sanitizedPhone)) {
        return sanitizedPhone.replace('+', '')
    } else if (/^2547\d{8}$/.test(sanitizedPhone)) {
        return sanitizedPhone
    }
    return sanitizedPhone
}
