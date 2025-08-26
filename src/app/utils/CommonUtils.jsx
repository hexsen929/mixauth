import {ref} from "valtio";


const debounceMap = {}

export function run(func, ...args) {
    return func(...args)
}


export function debounce(key, fn, delay) {
    if (debounceMap[key]) {
        clearTimeout(debounceMap[key])
    }
    debounceMap[key] = setTimeout(fn, delay)
}

export function getRoutePath() {
    return decodeURIComponent(window.location.hash.substring(1))
}

export async function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms))
}

export function formatFileSize(bytes, mb) {
    if (bytes === 0) return '0 B';
    if (mb && bytes > 1024 * 1024) {
        return (bytes / (1024 * 1024)).toFixed(2) + ' MB'
    }
    const sizes = ['B', 'KB', 'MB', 'GB', 'TB', 'PB'];
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    const formattedSize = parseFloat((bytes / Math.pow(1024, i)).toFixed(2));
    return `${formattedSize} ${sizes[i]}`;
}

export function noProxy(obj) {
    if (typeof obj !== 'object' || obj === null) {
        return obj; // 如果不是对象或为null，直接返回
    }
    return ref(obj)
}

export function safeInterval(fn, interval, {immediate = false} = {}) {
    let stopped = false;

    const run = async () => {
        if (!immediate) await sleep(interval); // 如果不是立即执行，先等一轮
        while (!stopped) {
            try {
                await fn();
            } catch (e) {
                console.error(e);
            }
            if (stopped) break;
            await sleep(interval);
        }
    };

    run();

    return () => {
        stopped = true;
    };
}


export function reverseSort(compareFn) {
    return (a, b) => compareFn(b, a); // 反转 a 和 b 的位置
}


export function getURLParam(key) {
    const url = new URL(window.location.href);
    return url.searchParams.get(key);
}

export function substringAfter(str, delimiter) {
    const index = str.indexOf(delimiter);
    if (index === -1) return str; // 没有找到分隔符返回空字符串
    return str.substring(index + delimiter.length);
}

export function substringAfterLast(str, delimiter) {
    const index = str.lastIndexOf(delimiter);
    if (index === -1) return str; // 没找到分隔符就返回原字符串
    return str.substring(index + delimiter.length);
}


export function encodeUrlPath(path) {
    return path
        .split('/')
        .map(segment => encodeURIComponent(segment))
        .join('/');
}


function extractNumber(str, start) {
    let result = 0;
    let i = start;
    while (i < str.length && /\d/.test(str[i])) {
        result = result * 10 + (str.charCodeAt(i) - 48);
        i++;
    }
    return result;
}

export function deepEqual(a, b) {
    // 基本类型和引用类型直接比较
    if (a === b) return true;

    // 不是对象，直接返回 false
    if (typeof a !== 'object' || a === null || typeof b !== 'object' || b === null) {
        return false;
    }

    // 获取对象的键集合，如果是数组，则是索引集合
    const aKeys = Object.keys(a);
    const bKeys = Object.keys(b);

    // 如果键的数量不相同，直接返回 false
    if (aKeys.length !== bKeys.length) return false;

    // 比较键及其对应的值
    return aKeys.every(key => b.hasOwnProperty(key) && deepEqual(a[key], b[key]));
}

export function compareByName(a, b) {
    let i1 = 0, i2 = 0;
    while (i1 < a.length && i2 < b.length) {
        if (/\d/.test(a[i1]) && /\d/.test(b[i2])) {
            const n1 = extractNumber(a, i1);
            const n2 = extractNumber(b, i2);
            i1 += n1.toString().length;
            i2 += n2.toString().length;
            if (n1 !== n2) return n1 - n2;
        } else {
            if (a[i1] !== b[i2]) return a[i1].charCodeAt(0) - b[i2].charCodeAt(0);
            i1++;
            i2++;
        }
    }
    return a.length - b.length;
}

