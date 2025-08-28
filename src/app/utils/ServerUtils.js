// hmac.js
import crypto from 'crypto';
import 'server-only'
import {headers} from "next/headers";

export function arrayBufferToBase64(input) {
    let buffer;

    if (input instanceof ArrayBuffer) {
        buffer = Buffer.from(input);
    } else if (ArrayBuffer.isView(input)) { // TypedArray 判断
        buffer = Buffer.from(input.buffer, input.byteOffset, input.byteLength);
    } else {
        throw new TypeError('Input must be ArrayBuffer or TypedArray');
    }

    return buffer.toString('base64');
}


export async function getIp() {
    try {
        // 获取请求头
        const h = await headers();

        // 取 x-forwarded-for（代理环境）或 fallback
        let ip = h.get('x-forwarded-for');

        if (ip) {
            ip = ip.split(',')[0].trim(); // 取第一个 IP
        } else {
            // headers() 里没有 remoteAddress，服务端获取不到就返回 null
            ip = null;
        }

        return ip;
    } catch (err) {
        return null
    }
}


// lib/withErrorHandler.js
export function withErrorHandler(handler) {
    return async function (request) {
        try {
            return await handler(request)
        } catch (e) {
            console.error(e)
            return new Response(
                JSON.stringify({error: e.message || "Invalid request"}),
                {status: 400, headers: {"Content-Type": "application/json"}}
            )
        }
    }
}


/**
 * 生成 HMAC
 * @param {string} key - 秘钥
 * @param {string} message - 要加密的消息
 * @param {string} algorithm - 哈希算法，如 'sha256', 'sha1'
 * @returns {string} - 返回 hex 格式的 HMAC
 */
export function hmac(key, message, algorithm = 'sha256') {
    return crypto.createHmac(algorithm, key)
        .update(message)
        .digest('hex');
}

/**
 * 验证签名
 * @param {string} signData - 前端返回的签名字符串 "timestamp|dataStr|hash"
 * @param {string} signKey - HMAC 秘钥
 * @param {number} [maxAge=300000] - 签名有效期，默认 10 分钟
 * @returns {{valid: boolean, data?: any, reason?: string}}
 */
export function verifySign(signData, signKey, maxAge = 10 * 60 * 1000) {
    const parts = signData.split('|');
    if (parts.length !== 3) {
        return {valid: false, reason: '签名格式错误'};
    }

    const [timestampStr, dataStr, hash] = parts;
    const timestamp = Number(timestampStr);
    if (isNaN(timestamp)) {
        return {valid: false, reason: '时间戳无效'};
    }

    // 检查时间戳是否过期
    if (Date.now() - timestamp > maxAge) {
        return {valid: false, reason: '签名已过期'};
    }

    // 使用你的 hmac 函数重新计算
    const hmacStr = hmac(signKey, `${timestamp}|${dataStr}`);

    if (hmacStr !== hash) {
        return {valid: false, reason: '签名不匹配'};
    }

    // 解码 data
    let data;
    try {
        data = JSON.parse(Buffer.from(dataStr, 'base64').toString('utf-8'));
    } catch (e) {
        return {valid: false, reason: '数据解析失败'};
    }

    return {valid: true, data};
}

/**
 * 生成签名
 * @param {any} data - 需要签名的数据对象
 * @param {string} signKey - HMAC 秘钥
 * @returns {{data: any, signData: string}}
 */
export function createSign(data, signKey) {
    // 1. JSON -> base64
    const dataStr = Buffer.from(JSON.stringify(data), 'utf-8').toString('base64');

    // 2. 拼接时间戳
    const timestamp = Date.now();
    const signStr = `${timestamp}|${dataStr}`;

    // 3. 计算 HMAC
    const hash = hmac(signKey, signStr);

    // 4. 最终签名
    const signData = `${signStr}|${hash}`;

    return {
        data,
        signData: signData
    };
}
