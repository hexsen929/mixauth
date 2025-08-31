import crypto from 'crypto';
import config from "@/config";
import {run} from "@/app/utils/CommonUtils";

/** 派生 32 字节 AES-256 密钥 */
function deriveKey(password) {
    return crypto.createHash('sha256').update(password, 'utf8').digest();
}

/** AES-GCM 加密字符串 */
function aesGcmEncrypt(plaintext, password) {
    const key = deriveKey(password);
    const iv = crypto.randomBytes(12);
    const cipher = crypto.createCipheriv('aes-256-gcm', key, iv);

    const encrypted = Buffer.concat([cipher.update(plaintext, 'utf8'), cipher.final()]);
    const authTag = cipher.getAuthTag();

    return Buffer.concat([iv, encrypted, authTag]).toString('base64');
}

/** AES-GCM 解密字符串 */
function aesGcmDecrypt(data, password) {
    const key = deriveKey(password);
    const input = Buffer.from(data, 'base64');
    const iv = input.subarray(0, 12);
    const authTag = input.subarray(input.length - 16);
    const encrypted = input.subarray(12, input.length - 16);

    const decipher = crypto.createDecipheriv('aes-256-gcm', key, iv);
    decipher.setAuthTag(authTag);

    const decrypted = Buffer.concat([decipher.update(encrypted), decipher.final()]);
    return decrypted.toString('utf8');
}

/**
 * encodeStrData
 * @param {string|object} data - 字符串或对象
 * @param {string} password - 用于加密的口令
 * @returns {string} base64 加密结果
 */
export function encodeStrData(data, password = config.signKey) {
    const str = run(() => {
        if (typeof data === 'string') {
            return data;
        }
        // 对象转 JSON
        return JSON.stringify(data);
    })

    return aesGcmEncrypt(str, password);
}

/**
 * decodeStrData
 * @param {string} data - base64 加密数据
 * @param {string} password - 用于解密的口令
 * @returns {string|object} 解密后的字符串或对象
 */
export function decodeStrData(data, password = config.signKey) {
    const decrypted = aesGcmDecrypt(data, password);
    try {
        return JSON.parse(decrypted);
    } catch (e) {
        return decrypted;
    }
}

