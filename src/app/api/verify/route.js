import {verifySign, withErrorHandler} from "@/app/utils/ServerUtils";
import config from "@/config";

export const POST = withErrorHandler(async (req) => {

    const body = await req.json()

    const sign = body.sign

    return Response.json({
        ...verifySign(sign, config.signKey, config.timeout),
        success: true,
    })
})