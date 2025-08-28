import {createSign, withErrorHandler} from "@/app/utils/ServerUtils";
import types from "@/app/auth_types/types";
import config from "@/config";
import 'server-only'

export const POST = withErrorHandler(async (req) => {

    const {id, type} = await req.json()

    const auth = types[type]

    const data = await auth.checkStatus(id)

    data.authType = type


    return Response.json({
        ...createSign(data, config.signKey),
        success: true,
    })
})