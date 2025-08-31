# MixAuth
无需任何手续，让你的应用快速支持 **QQ / 微信** 登录。 \
基于nextjs开发

## 在线体验
- 地址：[https://thorough-celisse-mixauth-f441c344.koyeb.app/](https://thorough-celisse-mixauth-f441c344.koyeb.app/)  
- 备用地址：[https://mixauth.onrender.com/](https://mixauth.onrender.com/)


## 功能
- 支持扫码登录  
- 实时显示二维码状态，包括是否已扫码、是否过期、是否被手机拒绝登录等  

## 原理
- 基于官方登录接口逆向实现  
- **二维码请求**：MixAuth 使用已上线应用的 `appid` 向腾讯请求二维码  
- **登录状态查询**：通过官方接口查询二维码的登录状态  

## 安全性与稳定性

- **推荐使用 QQ 登录**  
  微信登录存在一定限制：  
  - 无法直接获取 **微信号**  
  - 仅可获取 **微信昵称、头像、`unionid`、`openid`** 等信息（疑似加密后数据）  
  - 实际测试发现：同一账号的 `unionid` 在 `/` 之前的部分相同，可作为 **唯一账号标识**  

- **使用建议**  
  - 微信：仅推荐用于 **绑定后登录**，不建议作为直接登录方式  
  - QQ：推荐作为主要登录方式  

- **当前配置**  
  - 使用的 `appid`：腾讯客服
 

## 部署
- 编辑 `src/config.js`，将秘钥改为更复杂的秘钥 
- 需要 Node.js 运行环境  
- 安装依赖：`npm i`  
- 构建项目：`npm run build`  
- 启动服务：`npm run start`
- 也可使用：`next start` 或 `yarn start` 
- 可通过命令参数 `next start -p 端口` 或环境变量 `PORT` 指定端口  
- 可一键部署到 Vercel：[点击部署](https://vercel.com/new/clone?repository-url=https://github.com/InvertGeek/mixauth)  

## API 接入
- 使用接口可进行 API 接入  
- API 接入无需 verify 校验，自行根据 status 返回结果处理即可  
- 微信登录成功可能返回空信息，自行校验 unionid 是否为空  

## 接口
接口请求体格式均为 JSON，方法均为 POST  

### 获取二维码
**URL**：`/api/qr`  
**请求体格式**：
```json
{"type": "qq|wechat"}
```

### 查询二维码状态
**URL**：`/api/status`  
**请求体格式**：
```json
{"type": "qq|wechat", "id": "二维码id"}
```

### 校验登录信息
**URL**：`/api/verify`  
**请求体格式**：
```json
{"sign": "签名信息"}
```

## 快速接入
- 可直接使用 iframe 接入  
- 父页面接收登录回调示例：
```html
<script>
window.addEventListener('message', function(event) {
  const message = event.data;
  if (message && message.type === 'mixauth_login_result') {
    const loginResult = message.data;
    console.log('收到登录结果:', loginResult);
  }
});
</script>
```

- 结果格式为：**时间戳 | Base64 编码的登录结果 | HMAC 哈希值**  
- 校验结果时，请先确认结果中的 **QQ 或微信 unionid 不为空**，然后向 `/api/verify` 接口发送请求校验(后端进行)
- **必须校验，否则可能被伪造登录信息**


## 已知问题
- 只有通过摄像头扫描二维码才可登陆,qq微信禁止保存二维码到相册识别登陆

## Github Star
[![Stargazers over time](https://starchart.cc/InvertGeek/mixauth.svg?variant=adaptive)](https://starchart.cc/InvertGeek/mixauth)




