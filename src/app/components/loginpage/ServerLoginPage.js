import React from 'react';
import LoginPage from "@/app/components/loginpage/LoginPage";
import types from "@/app/auth_types/types";
import {connection} from "next/server";


async function ServerLoginPage({type}) {

    await connection()


    return (
        <LoginPage type={type} qr={await types[type].getQr()}/>
    );
}

export default ServerLoginPage;