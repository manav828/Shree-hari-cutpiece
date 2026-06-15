import crypto from "crypto";

const ALGORITHM = "aes-256-cbc";
// Derive a 32-byte key from the environment variable (or a stable fallback)
const ENCRYPTION_KEY = process.env.SHIPPING_ENCRYPTION_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY || "shree_hari_default_secret_key_32bytes_long";

// Helper to get key of exactly 32 bytes
function getSecretKey(): Buffer {
    return crypto.createHash("sha256").update(ENCRYPTION_KEY).digest();
}

export function encrypt(text: string): string {
    if (!text) return "";
    const iv = crypto.randomBytes(16);
    const cipher = crypto.createCipheriv(ALGORITHM, getSecretKey(), iv);
    let encrypted = cipher.update(text, "utf8", "hex");
    encrypted += cipher.final("hex");
    return `${iv.toString("hex")}:${encrypted}`;
}

export function decrypt(encryptedText: string): string {
    if (!encryptedText) return "";
    try {
        const parts = encryptedText.split(":");
        if (parts.length !== 2) {
            // Check if it's already masked (e.g. "••••••••••••")
            return encryptedText;
        }
        const iv = Buffer.from(parts[0], "hex");
        const encrypted = parts[1];
        const decipher = crypto.createDecipheriv(ALGORITHM, getSecretKey(), iv);
        let decrypted = decipher.update(encrypted, "hex", "utf8");
        decrypted += decipher.final("utf8");
        return decrypted;
    } catch (e) {
        console.error("Decryption failed:", e);
        return encryptedText; // Fallback to raw text if decryption fails
    }
}
