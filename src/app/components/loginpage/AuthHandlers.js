import {showLoginResult} from "@/app/components/loginpage/utils";

const qqHandler = {
    name: "qq",
    icon: '/qq.png',
    qrTip: '请使用手机QQ扫码登录',
    stateHandler(state, body) {
        const {data} = body
        if (data.code === '65') {
            state.expired = true;
            return
        }
        if (data.code === '68') {
            state.denied = true;
            return
        }
        if (data.code === '67') {
            state.scanned = true;
            return
        }
        if (data.code === '0' && data.success) {
            const {qq, avatar} = data
            showLoginResult(avatar, qq)
            state.success = true
            state.signData = body.signData
        }
    }
}

const weChatHandler = {
    name: "wechat",
    icon: '/wechat.png',
    qrTip: '请使用手机微信扫码登录',
    stateHandler(state, body) {
        const {data} = body
        if (data.wx_errcode === 404) {
            state.scanned = true;
            return
        }
        if (data.wx_errcode === 403) {
            state.denied = true;
            return
        }
        const wxData = data?.data
        if (wxData) {
            const {
                HeaderImg,
                NickName,
                UserIdStr,
            }
                = wxData.Data
            if (UserIdStr) {
                showLoginResult(HeaderImg, NickName)
                state.success = true
                state.signData = body.signData
            }
        }
    }
}

export const AuthHandlers = {
    qq: qqHandler,
    wechat: weChatHandler,
}