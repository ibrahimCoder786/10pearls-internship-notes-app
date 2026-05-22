// =============================================
// Util: Validators
// =============================================

export const isValidEmail = (email) =>
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

export const isStrongPassword = (password) =>
    password.length >= 8 &&
    /[A-Z]/.test(password) &&
    /[0-9]/.test(password);

export const isValidUrl = (url) => {
    try { new URL(url); return true; }
    catch { return false; }
};

export const stripHtml = (html) => {
    if (!html) return '';
    return html.replace(/<[^>]*>/g, '').trim();
};

export const truncate = (str, max = 120) => {
    if (!str) return '';
    return str.length > max ? str.slice(0, max) + '...' : str;
};