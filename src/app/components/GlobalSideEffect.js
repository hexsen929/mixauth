"use client"
import React, {useEffect} from 'react';
import {debounce} from "@/app/utils/CommonUtils";

function GlobalSideEffect(props) {

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
        <></>
    );
}

export default GlobalSideEffect;