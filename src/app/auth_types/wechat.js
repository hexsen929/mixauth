import {parse} from "node-html-parser";
import {XMLParser} from "fast-xml-parser";
import {client} from "@/config";
import "server-only"
import {QrFetcher} from "@/app/auth_types/utils";
import {logInfo} from "@/app/utils/LogUtil";
import {getIp} from "@/app/utils/ServerUtils";


const qrFetcher = new QrFetcher(getWechatQrInfo)

export default {
    name: "wechat",
    getQr: () => qrFetcher.consumeOldest(),
    checkStatus: checkWechatStatus
}


export async function getWechatQrInfo() {
    logInfo(`获取WeChat二维码 ${await getIp()}`)
    const response = await client.get('https://open.weixin.qq.com/connect/qrconnect?appid=wx31c7ba982b2ca865&redirect_uri=https%3A%2F%2Fkf.qq.com%2Fcgi-bin%2FwxloginKFWeb%3Fjumpurl%3Dhttps%253A%252F%252Fkf.qq.com%252F&scope=snsapi_login')
    const root = parse(response.data)
    const src = root.querySelector('img.js_qrcode_img').getAttribute('src')

    const uuid = src.split('/').pop()
    return {
        id: uuid,
        qrcode: `https://open.weixin.qq.com/connect/qrcode/${uuid}`
    }
}

function parseWindowVars(str) {
    const result = {};
    const regex = /window\.(\w+)\s*=\s*([^;]+);/g;
    let match;
    while ((match = regex.exec(str)) !== null) {
        let key = match[1];
        let value = match[2].trim();

        // 去掉引号
        if ((value.startsWith("'") && value.endsWith("'")) ||
            (value.startsWith('"') && value.endsWith('"'))) {
            value = value.slice(1, -1);
        } else if (!isNaN(value)) {
            // 数字转为 number
            value = Number(value);
        }

        result[key] = value;
    }
    return result;
}

function parseSetCookieToHeader(setCookieArray) {
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


export async function checkWechatStatus(uuid) {

    const response = await client.get(`https://lp.open.weixin.qq.com/connect/l/qrconnect?uuid=${uuid}&last=404`)

    const data = parseWindowVars(response.data)

    const {wx_code} = data

    if (wx_code) {

        const jumpResponse = await client.get(
            `https://kf.qq.com/cgi-bin/wxloginKFWeb?jumpurl=https%3A%2F%2Fkf.qq.com%2F&code=${wx_code}`
        )

        const cookies = jumpResponse.headers['set-cookie']

        const response = await client.get('https://kf.qq.com/cgi-bin/loginTitle', {
            headers: {
                'referer': 'https://kf.qq.com/',
                'Cookie': parseSetCookieToHeader(cookies)
            }
        });

        const xmlData = response.data

        return {
            success: true,
            rawData: xmlData,
            data: new XMLParser().parse(xmlData).root
        }

    }
    return data
}

