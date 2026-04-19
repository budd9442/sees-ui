import { generateSecret, generateURI, verify } from 'otplib';
import QRCode from 'qrcode';

/**
 * Generates a TOTP secret and a QR code for the user to scan.
 */
export async function generateTwoFactorSecret(email: string) {
    const secret = generateSecret();
    const otpauth = generateURI({
        issuer: 'SEES Academic Platform',
        label: email,
        secret: secret,
    });
    const qrCodeUrl = await QRCode.toDataURL(otpauth);
    
    return { secret, qrCodeUrl };
}

/**
 * Verifies a TOTP code against a secret.
 */
export async function verifyTwoFactorCode(code: string, secret: string) {
    try {
        return await verify({
            token: code,
            secret: secret,
        });
    } catch (error) {
        console.error('TOTP verification error:', error);
        return false;
    }
}

/**
 * Generates recovery backup codes.
 */
export function generateBackupCodes(count: number = 10) {
    const codes = [];
    for (let i = 0; i < count; i++) {
        // Simple random string generator
        codes.push(Math.random().toString(36).substring(2, 10).toUpperCase());
    }
    return codes;
}
