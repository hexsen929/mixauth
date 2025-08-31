import {validate, verifySign, withErrorHandler} from "@/app/utils/server/ServerUtils";
import config from "@/config";
import 'server-only'
import Joi from "joi";

export const POST = withErrorHandler(async (req) => {
    const json = await req.json();
    // Joi 验证 schema
    const schema = Joi.object({
        sign: Joi.string()
            .required()
    });

    validate(json, schema)
    const body = await json

    const sign = body.sign

    return Response.json({
        ...verifySign(sign, config.signKey, config.timeout),
        success: true,
    })
})