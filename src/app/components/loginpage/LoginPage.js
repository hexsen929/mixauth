"use client"
import React, {useEffect} from 'react';
import styled from "styled-components";
import useApi from "@/app/utils/hooks/useApi";
import Image from "next/image";
import useProxyState from "@/app/utils/hooks/useProxyState";
import {run} from "@/app/utils/CommonUtils";
import {handlers} from "@/app/components/loginpage/handlers";
import {sendLoginResult} from "@/app/components/loginpage/utils";

const Container = styled.div`
    display: flex;
    width: 100%;
    height: 100vh;
    justify-content: center;
    align-items: center;
    user-select: none;


    > .content {
        display: flex;
        flex-direction: column;
        gap: 20px;
        justify-content: center;
        align-items: center;

        .tip {
            color: gray;
            font-size: 14px;
        }

        .qrcode {
            display: flex;
            justify-content: center;
            align-items: center;
            flex-wrap: wrap;
            background-color: rgba(87, 131, 182, 0.21);
            width: 152px;
            height: 152px;
            overflow: hidden;
            border-radius: 5px;
            border: 2px solid #3d8de8;

            .qr-tip {
                font-size: 14px;
                word-break: break-all;
                font-weight: bold;
                color: #004cb0;
            }

            img {
                width: 100%;
                height: 100%;
            }

            &.expired, &.denied, &.scanned {
                cursor: pointer;
            }
        }

        .state {
            display: flex;
            justify-content: center;
            align-items: center;
            gap: 10px;
            border-radius: 50px;
            padding: 10px 20px;
            color: rgba(128, 128, 128, 0.67);
            background-color: rgba(128, 128, 128, 0.09);
        }
    }
`

function Page({name = 'qq'}) {

    const handler = handlers[name];

    const state = useProxyState({
        qrcode: null,
        authType: null,
        id: null,
        scanned: false,
        expired: false,
        denied: false,
        success: false,
        signData: null,
    })

    const {
        authType,
        id,
        qrcode,
        expired,
        scanned,
        denied,
        success,
    } = state

    useEffect(() => {
        const signData = state.signData
        if (success && signData) {
            sendLoginResult(signData)
        }
    }, [success, handler])

    useApi({
        path: `/api/status`,
        method: 'POST',
        request: !!id && !success && !denied && !expired,
        refreshInterval: 1000,
        body: {
            type: authType,
            id
        },
        callback(body) {
            handler.stateHandler(state, body)
        }
    })


    const {content} = useApi({
        path: '/api/qr',
        method: 'POST',
        body: {
            type: handler.name,
        },
        callback({data}) {
            for (const key in data) {
                state[key] = data[key];
            }
        },
        content(data) {
            if (!state.qrcode) {
                return null
            }

            const classMap = {
                expired,
                scanned,
                denied,
                success,
            }

            const classes = Object.keys(classMap).filter(key => classMap[key])

            const tipMap = {
                "登录成功": success,
                "二维码已失效": expired,
                "本次登录已被拒绝": denied,
                "请在手机上确认登录": scanned,
            }

            const someTip = Object.keys(tipMap).filter(key => tipMap[key])

            const qrElement = run(() => {

                if (someTip.length > 0) {
                    return (
                        <div className={'qr-tip'}>
                            {someTip[0]}
                        </div>
                    )
                }
                return (
                    <img
                        src={qrcode}
                        alt={'二维码'}
                    />
                )
            })

            return (
                <div className={'content'}>
                    <div className={'tip'}>安全登录，防止被盗</div>

                    <div className={`qrcode shadow ${classes.join(' ')}`} onClick={() => {
                        if (someTip.length > 0) {
                            window.location.reload()
                        }
                    }}>
                        {qrElement}
                    </div>

                    <div className={'state'}>
                        <Image
                            src={handler.icon}
                            width={20}
                            height={20}
                            alt={handler.name}
                        />
                        {handler.qrTip}
                    </div>
                </div>
            )
        }
    })

    return (
        <Container>
            {content}
        </Container>
    );
}

export default Page;