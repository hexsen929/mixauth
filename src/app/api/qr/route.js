import {AuthTypes} from "@/app/auth_types/AuthTypes";
import {withErrorHandler} from "@/app/utils/ServerUtils";
import 'server-only'

export const POST = withErrorHandler(async (req) => {

// request.json() 解析 JSON 请求体
    const {type} = await req.json()

    const auth = AuthTypes[type]

    const data = await auth.getQr()

    data.authType = type

    return Response.json({
        data,
        success: true,
    })
})