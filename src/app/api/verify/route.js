import {verifySign, withErrorHandler} from "@/app/utils/ServerUtils";
import config from "@/config";

export const POST = withErrorHandler(async (req) => {

// request.json() 解析 JSON 请求体
    const body = await req.json()

    const sign = body.sign

    return Response.json({
        ...verifySign(sign, config.signKey, config.timeout),
        success: true,
    })
})