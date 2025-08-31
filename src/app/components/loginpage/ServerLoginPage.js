import React from 'react';
import LoginPage from "@/app/components/loginpage/LoginPage";
import {AuthTypes} from "@/app/auth_types/AuthTypes";
import {connection} from "next/server";


async function ServerLoginPage({type}) {

    await connection()


    return (
        <LoginPage type={type} qr={await AuthTypes[type].getQr()}/>
    );
}

export default ServerLoginPage;