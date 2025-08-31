import {createSign, validate, withErrorHandler} from "@/app/utils/server/ServerUtils";
import {AuthTypes} from "@/app/auth_types/AuthTypes";
import config from "@/config";
import 'server-only'
import Joi from "joi";

export const POST = withErrorHandler(async (req) => {

    const json = await req.json();
    // Joi 验证 schema
    const schema = Joi.object({
        type: Joi.string()
            .valid(...Object.keys(AuthTypes))
            .required(),
        id: Joi.string().required()
    });

    validate(json, schema)

    const {id, type} = json

    const auth = AuthTypes[type]

    const data = await auth.checkStatus(id)

    data.authType = type


    return Response.json({
        ...createSign(data, config.signKey),
        success: true,
    })
})