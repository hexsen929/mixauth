import {addDialog, dialogList} from "@/app/utils/DialogContainer";
import DialogDiv from "@/app/components/DialogDiv";
import React from "react";
import styled from "styled-components";
import {Button} from "@mui/material";

export function sendLoginResult(result) {
    // 通用版：允许任何父页面接收
    window.parent.postMessage(
        {type: 'mixauth_login_result', data: result},
        '*' // 因为通用页面，不确定父域名
    );
}

const LoginResultContainer = styled(DialogDiv)`
    justify-content: center;
    align-items: center;

    p {
        font-weight: normal;
        font-size: 14px;
    }

    .content {
        align-items: center;
        justify-content: center;

        .avatar {
            overflow: hidden;
            border-radius: 10px;

            img {
                width: 100px;
                height: 100px;
            }
        }
    }
`

export function showLoginResult(avatar, id) {
    if (isInIframe()) {
        return
    }


    addDialog(
        <LoginResultContainer>
            <h4>登录成功</h4>
            <div className="content">
                <div className="avatar shadow">
                    <img src={avatar} alt="头像"/>
                </div>
                <div className="account">帐号: {decodeURIComponent(id)}</div>
            </div>
            <p>此窗口不会在iframe内显示</p>
            <Button
                variant={'contained'}
                onClick={() => {
                    dialogList.pop()
                }}>
                关闭
            </Button>
        </LoginResultContainer>
    )
}

export function isInIframe() {
    try {
        return window.self !== window.top;
    } catch (e) {
        // 如果跨域嵌套iframe，访问window.top会抛异常
        return true;
    }
}
