import React from 'react';
import LoginPage from "@/app/components/loginpage/LoginPage";
import types from "@/app/auth_types/types";

async function ServerLoginPage({type}) {

    return (
        <LoginPage type={type} qr={await types[type].getQr()}/>
    );
}

export default ServerLoginPage;