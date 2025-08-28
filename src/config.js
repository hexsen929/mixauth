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
}