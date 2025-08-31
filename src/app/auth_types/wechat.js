import {parse} from "node-html-parser";
import "server-only"
import {QrFetcher} from "@/app/auth_types/utils";
import {logInfo} from "@/app/utils/LogUtil";
import {createCookieClient, getIp} from "@/app/utils/server/ServerUtils";
import {getUrlParam} from "@/app/utils/CommonUtils";
import {decodeStrData, encodeStrData} from "@/app/utils/server/aes";


const qrFetcher = new QrFetcher(getWechatQrInfo)

export default {
    name: "wechat",
    getQr: () => qrFetcher.consumeOldest(),
    checkStatus: checkWechatStatus
}


export async function getWechatQrInfo() {
    logInfo(`获取WeChat二维码 ${await getIp()}`)
    const {cookieClient, jar} = createCookieClient();
    const response = await cookieClient.get(`https://smartproxy.tencent.com/connect/login?appid=careers&state=https%3A%2F%2Fcareers.tencent.com%2Fhome.html&sourceid=2&t=${Date.now()}`)
    const root = parse(response.data)
    const src = root.querySelector('img.js_qrcode_img').getAttribute('src')
    const lastUrl = response.request.res.responseUrl
    const state = getUrlParam(lastUrl, 'state')
    const callback = getUrlParam(lastUrl, 'redirect_uri')

    const uuid = src.split('/').pop()

    const cookies = await jar.getCookies('https://smartproxy.tencent.com')

    const stateToken = cookies.find((it) => {
        return it.key === 'state_token'
    }).value

    const idData = encodeStrData({
        uuid,
        callback,
        state,
        stateToken,
    })

    return {
        id: idData,
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

export async function checkWechatStatus(idData) {
    const {uuid, callback, state, stateToken} = decodeStrData(idData)

    const {cookieClient, jar} = createCookieClient()
    await jar.setCookie(`state_token=${stateToken}`, 'https://smartproxy.tencent.com')

    const response = await cookieClient.get(`https://lp.open.weixin.qq.com/connect/l/qrconnect?uuid=${uuid}&last=404`)

    const data = parseWindowVars(response.data)

    const {wx_code} = data

    if (wx_code) {
        //获取cookie
        await cookieClient.get(
            `${callback}?code=${wx_code}&state=${state}`
        )


        const response = await cookieClient.get(`https://careers.tencent.com/tencentcareer/api/user/GetCurrentUser?timestamp=${Date.now()}`, {
            headers: {
                'referer': 'https://careers.tencent.com/home.html',
            }
        });


        return {
            success: true,
            data: response.data
        }

    }
    return data
}

