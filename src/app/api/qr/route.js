import types from "@/app/auth_types/types";
import {withErrorHandler} from "@/app/utils/ServerUtils";

export const POST = withErrorHandler(async (req) => {

// request.json() 解析 JSON 请求体
    const {type} = await req.json()

    const auth = types[type]

    const data = await auth.getQr()

    data.authType = type

    return Response.json({
        data,
        success: true,
    })
})