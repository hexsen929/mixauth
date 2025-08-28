import {arrayBufferToBase64} from "@/app/utils/ServerUtils";
import {client} from "@/config";
import "server-only"
import {QrFetcher} from "@/app/auth_types/utils";
import {logInfo} from "@/app/utils/LogUtil";

function hash33(t) {
    let e = 0;
    for (let n = 0, o = t.length; n < o; ++n) {
        e += (e << 5) + t.charCodeAt(n);
    }
    return 2147483647 & e;
}


const qrFetcher = new QrFetcher(getQqQrInfo)

export default {
    name: "qq",
    getQr: () => qrFetcher.consumeOldest(),
    checkStatus: checkQqStatus
}


export async function getQqQrInfo() {
    logInfo('获取QQ二维码')
    const response = await client.get('https://xui.ptlogin2.qq.com/ssl/ptqrshow', {
        params: {
            'appid': '716027609',
            'e': '2',
            'daid': '383',
            'pt_3rd_aid': '101487640',
        },
        responseType: "arraybuffer",
    });

    return {
        id: response.headers['set-cookie'][0].match(/(?:^|;\s*)qrsig=([^;]+)/)[1],
        qrcode: `data:image/png;base64,${arrayBufferToBase64(response.data)}`
    }
}

export async function checkQqStatus(sig) {
    const response = await client.get('https://xui.ptlogin2.qq.com/ssl/ptqrlogin', {
        params: {
            'u1': 'https://graph.qq.com/oauth2.0/login_jump',
            'ptqrtoken': hash33(sig),
            'from_ui': '1',
            'aid': '716027609',
            'daid': '383',
            'pt_3rd_aid': '101487640'
        },
        headers: {
            'Cookie': `qrsig=${sig}`
        }
    });
    return parsePtuiCB(response.data)
}

function getQueryParam(url, paramName) {
    try {
        const urlObj = new URL(url);
        return urlObj.searchParams.get(paramName);
    } catch (e) {
        console.error("Invalid URL:", e.message);
        return null;
    }
}

function parsePtuiCB(str, asObject = true) {
    const match = str.match(/^ptuiCB\((.*)\)$/);
    if (!match) return null;

    const args = match[1]
        .split(',')
        .map(s => s.trim().replace(/^'(.*)'$/, '$1'));

    if (!asObject) {
        // 返回数组
        return args;
    }

    const data = {
        code: args[0],
        status: args[1],
        redirect: args[2],
        extra2: args[3],
        message: args[4],
        username: args[5],
    }

    const {code, redirect} = data

    //登录成功返回qq
    if (code === '0' && redirect) {
        const qq = getQueryParam(redirect, 'uin')
        data.qq = qq
        data.avatar = `https://q.qlogo.cn/headimg_dl?dst_uin=${qq}&spec=640&img_type=jpg`
        data.success = true
    }

    // 返回对象（针对 QQ 登录二维码固定格式）
    return data;
}

