export function isValidEmail(email: string): boolean {
    return /^[\w-.]+@[\w-]+\.[a-zA-Z]{2,}$/.test(email);
} 