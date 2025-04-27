export const formatSomaliNumber = (phone: string): string => {
    const sanitizedPhone = phone.replace(/\s+/g, '')

    if (/^06\d{8}$/.test(sanitizedPhone)) {
        return `252${sanitizedPhone.slice(1)}`
    } else if (/^\+2526\d{8}$/.test(sanitizedPhone)) {
        return sanitizedPhone.replace('+', '')
    } else if (/^2526\d{8}$/.test(sanitizedPhone)) {
        return sanitizedPhone
    }
    return sanitizedPhone
}
