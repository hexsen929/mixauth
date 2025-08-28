import axios from "axios";
import "server-only"
import axiosRetry from "axios-retry";

export const client = axios.create({
    withCredentials: true,
    headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/139.0.0.0 Safari/537.36"
    }
})

axiosRetry(client, {
    retries: 3,
    retryDelay: (retryCount) => {
        return retryCount * 100;
    }
});

export default {
    title: 'MixAuth',
    description: 'mixauth登录',
    //请自行更换为更复杂的key(22位以上)
    signKey: "123",
    //登录信息校验过期时间，默认10分钟
    timeout: 1000 * 60 * 10,
    //获取二维码输出的ip地址请求头
    ipHeader: 'x-forwarded-for',
    //二维码缓存配置
    //在用户访问网站前提前定时任务轮询拉取二维码到缓存中
    //用户访问时直接从缓存取二维码，提升页面加载速度
    //境外服务器拉取二维码可能要1秒左右.如果部署在境内可改为0
    //如果使用云函数部署，建议改为0节约算力
    qrCache: {
        //缓存大小,默认0禁用,可自行更改
        size: 0,
        //二维码过期时间,毫秒
        expire: 1000 * 10,
        //拉取二维码缓存间隔
        interval: 500,
    }
}