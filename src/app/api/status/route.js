import {createSign, withErrorHandler} from "@/app/utils/ServerUtils";
import {AuthTypes} from "@/app/auth_types/AuthTypes";
import config from "@/config";
import 'server-only'

export const POST = withErrorHandler(async (req) => {

    const {id, type} = await req.json()

    const auth = AuthTypes[type]

    const data = await auth.checkStatus(id)

    data.authType = type


    return Response.json({
        ...createSign(data, config.signKey),
        success: true,
    })
})