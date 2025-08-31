// hmac.js
import crypto from 'crypto';
import 'server-only'
import {headers} from "next/headers";
import config, {client} from "@/config";
import {wrapper} from "axios-cookiejar-support";
import {CookieJar} from "tough-cookie";
import {parse} from "node-html-parser";

// validator.js

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
        const h = await headers()
        const ip = h.get(config.ipHeader);
        return ip?.split(",")[0].trim() ?? null;
    } catch {
        return null;
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

export function parseSetCookieToHeader(setCookieArray) {
    const cookieMap = new Map();

    setCookieArray.forEach(cookieStr => {
        // 取分号前的 key=value 部分
        const [keyValue] = cookieStr.split(';');
        const [key, value] = keyValue.split('=');
        // 同名 cookie 保留最后一个
        cookieMap.set(key.trim(), value.trim());
    });

    // 拼接成 Cookie 请求头字符串
    return Array.from(cookieMap.entries())
        .map(([key, value]) => `${key}=${value}`)
        .join('; ');
}

/**
 * 获取 CookieJar 中全部 cookie
 * @param {CookieJar} jar
 * @returns {Record<string, Record<string, string>>} 域名 => { key: value }
 */
export function getAllCookies(jar) {
    const serialized = jar.serializeSync();
    const result = {};

    serialized.cookies.forEach(cookie => {
        const {key, value} = cookie;
        const domain = cookie.domain.startsWith('.') ? cookie.domain.slice(1) : cookie.domain;

        if (!result[domain]) result[domain] = {};
        result[domain][key] = value;
    });

    return result;
}


export function createCookieClient(maxScriptRedirects = 5) {
    const jar = new CookieJar();
    const cookieClient = wrapper(
        client.create({
            jar
        })
    );

    cookieClient.interceptors.request.use(async req => {
        // console.log(req.url)
        return req;
    });

    //跟随单标签script跳转
    cookieClient.interceptors.response.use(async (res) => {
        const ctype = res.headers["content-type"] || "";
        if (!/text\/html/i.test(ctype) || typeof res.data !== "string") {
            return res;
        }

        const root = parse(res.data);
        const scripts = root.querySelectorAll("script");
        if (scripts.length !== 1) return res;

        const scriptText = scripts[0].innerText.trim();
        const m = /^location\.replace\(['"]([^'"]+)['"]\)/i.exec(scriptText);
        if (!m) return res;

        const redirectUrl = new URL(m[1], res.config.url).toString();
        const count = (res.config._scriptRedirectCount || 0) + 1;
        if (count > maxScriptRedirects) throw new Error("script 跳转过多");
        return cookieClient.get(redirectUrl, {...res.config, _scriptRedirectCount: count});
    });

    return {cookieClient, jar};
}

/**
 * 通用验证函数
 * @param {any} data - 待验证的数据，可以是对象或字符串
 * @param {Joi.Schema} schema - Joi 验证规则
 * @param {boolean} [throwOnError=false] - 是否在验证失败时抛出异常
 * @returns {object} { valid: boolean, value?: any, error?: string }
 */
export function validate(data, schema, throwOnError = true) {
    const {error, value} = schema.validate(data, {abortEarly: false});

    if (error) {
        if (throwOnError) throw error;
        return {
            valid: false,
            error: error.details.map(d => d.message).join(', ')
        };
    }

    return {
        valid: true,
        value
    };
}


/**
 * Base64 编码
 * @param {string} str - 要编码的字符串
 * @returns {string} Base64 编码后的字符串
 */
export function base64Encode(str) {
    return Buffer.from(str, 'utf-8').toString('base64');
}

/**
 * Base64 解码
 * @param {string} base64Str - Base64 编码的字符串
 * @returns {string} 解码后的字符串
 */
export function base64Decode(base64Str) {
    return Buffer.from(base64Str, 'base64').toString('utf-8');
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
        data = JSON.parse(base64Decode(dataStr));
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
    const dataStr = base64Encode(JSON.stringify(data));

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
