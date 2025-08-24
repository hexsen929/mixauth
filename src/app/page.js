"use client"
import {debounce} from "@/app/utils/CommonUtils";
import styled from "styled-components";
import Image from "next/image";
import Link from "next/link";
import {useEffect} from "react";


const Container = styled.div`
    display: flex;
    width: 100%;
    height: 100vh;
    justify-content: center;
    align-items: center;

    > .content {
        display: flex;
        flex-direction: column;
        gap: 10px;

        > a {
            &:hover {
                background-color: rgba(127, 255, 212, 0.22);
            }

            overflow: hidden;
            padding: 10px 50px;
            border-radius: 5px;
            transition: .3s;
            display: flex;
            gap: 10px;
            align-items: center;
            font-weight: bold;
            text-decoration: none;
            color: #022c1e;
        }


    }
`


export default function Home() {

    useEffect(() => {

        console.info('由MixAuth提供认证支持')

        function updateSize() {
            const width = Math.max(window.innerWidth, window.innerHeight)
            document.documentElement.style.fontSize = width / 100 + 'px'
        }

        updateSize()

        window.addEventListener('resize', () => {
            debounce('resize', updateSize, 500)
        })
    }, [])

    return (
        <Container>
            <div className="content">

                <Link href={'/qq'} className={'shadow'}>
                    <Image
                        src={'/qq.png'}
                        width={50}
                        height={50}
                        alt="qq登录"
                    />
                    QQ登录
                </Link>
                <Link href={'/wechat'} className={'shadow'}>
                    <Image
                        src={'/wechat.png'}
                        width={50}
                        height={50}
                        alt="微信登录"
                    />
                    微信登录
                </Link>

            </div>

        </Container>
    );
}
