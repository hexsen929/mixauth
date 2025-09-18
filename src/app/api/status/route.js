import { createSign, validate, withErrorHandler } from "@/app/utils/server/ServerUtils";
import { AuthTypes } from "@/app/auth_types/AuthTypes";
import config from "@/config";
import 'server-only';
import Joi from "joi";

// ✅ 处理 OPTIONS 预检请求
export async function OPTIONS() {
  return new Response(null, {
    status: 200,
    headers: {
      "Access-Control-Allow-Origin": "https://www.hexsen.com", // 允许的前端域名
      "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
    },
  });
}

// ✅ 处理 POST 请求
export const POST = withErrorHandler(async (req) => {
  const json = await req.json();

  // Joi 验证 schema
  const schema = Joi.object({
    type: Joi.string()
      .valid(...Object.keys(AuthTypes))
      .required(),
    id: Joi.string().required()
  });

  validate(json, schema);

  const { id, type } = json;
  const auth = AuthTypes[type];
  const data = await auth.checkStatus(id);
  data.authType = type;

  // ⭐ 在 Response 中加 CORS 头
  return new Response(
    JSON.stringify({
      ...createSign(data, config.signKey),
      success: true,
    }),
    {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "https://www.hexsen.com", // 允许的前端域名
        "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type",
      },
    }
  );
});
