/**
 * Shared input validation utilities for client and server side.
 */

export function validateName(name: string): string | null {
    const trimmed = (name || "").trim();
    if (!trimmed) {
        return "Name is required.";
    }
    if (trimmed.length > 100) {
        return "Name must be 100 characters or less.";
    }
    return null;
}

export function validateEmail(email: string, required: boolean = true): string | null {
    const trimmed = (email || "").trim();
    if (!trimmed) {
        return required ? "Email address is required." : null;
    }
    if (trimmed.length > 254) {
        return "Email address must be 254 characters or less.";
    }
    // Simple standard RFC 5322 regex check for basic syntax sanity
    const emailRegex = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;
    if (!emailRegex.test(trimmed)) {
        return "Please enter a valid email address.";
    }
    return null;
}

export function validatePassword(password: string): string | null {
    if (!password) {
        return "Password is required.";
    }
    if (password.length < 8) {
        return "Password must be at least 8 characters long.";
    }
    if (password.length > 128) {
        return "Password must be 128 characters or less.";
    }
    return null;
}

export function validatePhone(phone: string): string | null {
    const trimmed = (phone || "").trim();
    if (!trimmed) {
        return "Phone number is required.";
    }
    // Strip standard spacing/decorations/plus/prefix 91
    const cleanPhone = trimmed.replace(/[\s\-\(\)\+]/g, "");
    const finalPhone = (cleanPhone.length === 12 && cleanPhone.startsWith("91")) ? cleanPhone.slice(2) : cleanPhone;
    
    // Indian mobile phone format validation (10 digits starting with 6, 7, 8, or 9)
    const phoneRegex = /^[6-9]\d{9}$/;
    if (!phoneRegex.test(finalPhone)) {
        return "Please enter a valid 10-digit mobile number.";
    }
    return null;
}

export function validatePincode(pincode: string): string | null {
    const trimmed = (pincode || "").trim();
    if (!trimmed) {
        return "Pincode is required.";
    }
    const cleanPincode = trimmed.replace(/\s/g, "");
    
    // Indian pincode format validation (6 digits, first digit 1-9)
    const pincodeRegex = /^[1-9]\d{5}$/;
    if (!pincodeRegex.test(cleanPincode)) {
        return "Please enter a valid 6-digit pincode.";
    }
    return null;
}

export function validateAddressLine(line: string, label: string = "Address line", required: boolean = true): string | null {
    const trimmed = (line || "").trim();
    if (!trimmed) {
        return required ? `${label} is required.` : null;
    }
    if (trimmed.length > 100) {
        return `${label} must be 100 characters or less.`;
    }
    return null;
}

export function validateCity(city: string): string | null {
    const trimmed = (city || "").trim();
    if (!trimmed) {
        return "City is required.";
    }
    if (trimmed.length > 50) {
        return "City must be 50 characters or less.";
    }
    return null;
}

export function validateState(state: string): string | null {
    const trimmed = (state || "").trim();
    if (!trimmed) {
        return "State is required.";
    }
    if (trimmed.length > 50) {
        return "State must be 50 characters or less.";
    }
    return null;
}

export function validateNotes(notes: string): string | null {
    const trimmed = (notes || "").trim();
    if (trimmed.length > 500) {
        return "Notes must be 500 characters or less.";
    }
    return null;
}
