"use client"
import React, {useEffect} from 'react';
import {debounce} from "@/app/utils/CommonUtils";

function GlobalSideEffect(props) {

    useEffect(() => {

        console.info('由MixAuth提供认证支持')

    }, [])

    return (
        <></>
    );
}

export default GlobalSideEffect;