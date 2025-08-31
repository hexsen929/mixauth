import {AuthTypes} from "@/app/auth_types/AuthTypes";
import {validate, withErrorHandler} from "@/app/utils/server/ServerUtils";
import 'server-only'
import Joi from "joi";

export const POST = withErrorHandler(async (req) => {


    const json = await req.json();
    // Joi 验证 schema
    const schema = Joi.object({
        type: Joi.string()
            .valid(...Object.keys(AuthTypes))
            .required()
    });

    validate(json, schema)

    const {type} = json

    const auth = AuthTypes[type]

    const data = await auth.getQr()

    data.authType = type

    return Response.json({
        data,
        success: true,
    })
})