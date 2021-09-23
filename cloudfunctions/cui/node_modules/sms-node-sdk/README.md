腾讯云短信 Node SDK
===

## 腾讯短信服务

目前`腾讯云短信`为客户提供`国内短信`、`国内语音`和`海外短信`三大服务，腾讯云短信SDK支持以下操作：

### 国内短信

国内短信支持操作：

- 单发短信
- 指定模板单发短信
- 群发短信
- 指定模板群发短信
- 拉取短信回执和短信回复状态

> `Note` 短信拉取功能需要联系腾讯云短信技术支持(QQ:3012203387)开通权限，量大客户可以使用此功能批量拉取，其他客户不建议使用。

### 海外短信

海外短信支持操作：

- 单发短信
- 指定模板单发短信
- 群发短信
- 指定模板群发短信
- 拉取短信回执和短信回复状态

> `Note` 海外短信和国内短信使用同一接口，只需替换相应的国家码与手机号码，每次请求群发接口手机号码需全部为国内或者海外手机号码。

### 语音通知

语音通知支持操作：

- 发送语音验证码
- 发送语音通知
- 上传语音文件
- 按语音文件fid发送语音通知
- 指定模板发送语音通知类

## 开发

### 准备

在开始开发云短信应用之前，需要准备如下信息:

- [x] 获取SDK AppID和AppKey

云短信应用SDK `AppID` 和 `AppKey` 可在[短信控制台](https://console.cloud.tencent.com/sms)的应用信息里获取，如您尚未添加应用，请到[短信控制台](https://console.cloud.tencent.com/sms)中添加应用。

- [x] 申请签名

一个完整的短信由短信`签名`和短信正文内容两部分组成，短信`签名`须申请和审核，`签名`可在[短信控制台](https://console.cloud.tencent.com/sms)的相应服务模块`内容配置`中进行申请。

- [x] 申请模板

同样短信或语音正文内容`模板`须申请和审核，`模板`可在[短信控制台](https://console.cloud.tencent.com/sms)的相应服务模块`内容配置`中进行申请。

## 安装

### npm
```shell
npm install sms-node-sdk
```

### 手动

1. 手动下载或clone最新版本 `sms-node-sdk` 代码
2. 把 `sms-node-sdk` 把代码放入项目目录
3. 然后在项目里require sms-node-sdk, 如: `var moduleName = require("path/to/sms-node-sdk")`

## 用法

### 文档

若您对接口存在疑问，可以查阅:

* [API开发指南](https://cloud.tencent.com/document/product/382/5808)
* [SDK文档](https://github.com/TencentCloudBase/sms-node-sdk/blob/master/docs/README.md)
* [错误码](https://cloud.tencent.com/document/product/382/3771)

### 示例

* 本示例只展示 `promise` 的用法，如果想用 `async/await`，可参考 `test` 测试目录里的示例。

- **准备必要参数和实例化SmsClient**

```javascript
const {
    SmsClient
} = require('sms-node-sdk');

// 短信应用SDK AppID
const appid = 1400009099;  // SDK AppID是1400开头

// 短信应用SDK AppKey
const appkey = '9ff91d87c2cd7cd0ea762f141975d1df37481d48700d70ac37470aefc60f9bad';

// 需要发送短信的手机号码
const phoneNumbers = ['21212313123', '12345678902', '12345678903'];
const phoneNumber = '21212313123'

// 短信模板ID，需要在短信应用中申请
const templId = 7839;  // NOTE: 这里的模板ID`7839`只是一个示例，真实的模板ID需要在短信控制台中申请

// 签名
const smsSign = '腾讯云云开发';  // NOTE: 这里的签名只是示例，请使用真实的已申请的签名, 签名参数使用的是`签名内容`，而不是`签名ID`

// 实例化smsClient
let smsClient = new SmsClient({ AppID, AppKey });
```

- **单发短信**

```javascript
smsClient.init({
    action: 'SmsSingleSend',
    data: {
        msgType: 0, // Enum{0: 普通短信, 1: 营销短信}
        nationCode: '86',
        phoneNumber,
        msg: '【腾讯云】您的验证码是: 5678！'
    }
}).then((res) => {
    // 处理结果
});
```

> `Note` 如需发送海外短信，同样可以使用此接口，只需将国家码"86"改写成对应国家码号。
> `Note` 无论单发/群发短信还是指定模板ID单发/群发短信都需要从控制台中申请模板并且模板已经审核通过，才可能下发成功，否则返回失败。

- **指定模板ID单发短信**

```javascript
smsClient.init({
    action: 'SmsSingleSendTemplate',
    data: {
        nationCode: '86',
        phoneNumber,
        templId: 278435,
        params: ['5678'],
        sign: smsSign // 签名参数未提供或者为空时，会使用默认签名发送短信
    }
}).then((res) => {
    // 处理结果
});
```

> `Note` 无论单发/群发短信还是指定模板ID单发/群发短信都需要从控制台中申请模板并且模板已经审核通过，才可能下发成功，否则返回失败。

- **群发**

```javascript
smsClient.init({
    action: 'SmsMultiSend',
    data: {
        msgType: 0, // Enum{0: 普通短信, 1: 营销短信}
        nationCode: '86',
        phoneNumbers,
        msg: '【腾讯云】您的验证码是: 5678'
    }
}).then((res) => {
    // 处理结果
});
```

> `Note` 无论单发/群发短信还是指定模板ID单发/群发短信都需要从控制台中申请模板并且模板已经审核通过，才可能下发成功，否则返回失败。

- **指定模板ID群发**

```javascript
smsClient.init({
    action: 'SmsMultiSendTemplate',
    data: {
        nationCode: '86',
        phoneNumbers,
        templId,
        params: ['5678'],
        sign: smsSign // 签名参数未提供或者为空时，会使用默认签名发送短信
    }
}).then((res) => {
    // 处理结果
});
```

> `Note` 群发一次请求最多支持200个号码，如有对号码数量有特殊需求请联系腾讯云短信技术支持(QQ:3012203387)。

- **发送语音验证码**

```javascript
smsClient.init({
    action: 'CodeVoiceSend',
    data: {
        nationCode: '86',
        phoneNumber,
        msg: '1234',
        playtimes: 2
    }
}).then((res) => {
    // 处理结果
});
```

> `Note` 语音验证码发送只需提供验证码数字，例如当msg=“5678”时，您收到的语音通知为“您的语音验证码是5678”，如需自定义内容，可以使用语音通知。

- **发送语音通知**

```javascript
smsClient.init({
    action: 'PromptVoiceSend',
    data: {
        nationCode: '86',
        phoneNumber,
        msg: '5678',
        playtimes: 2
    }
}).then((res) => {
    // 处理结果
});
```

- **拉取短信回执以及回复**

```javascript
const maxNum = 10;  // 单次拉取最大量

// 拉取短信回执
smsClient.init({
    action: 'SmsStatusPullCallback',
    data: {
        maxNum
    }
}).then((res) => {
    // 处理结果
});


// 拉取回复
smsClient.init({
    action: 'SmsStatusPullReply',
    data: {
        maxNum
    }
}).then((res) => {
    // 处理结果
});
```

> `Note` 短信拉取功能需要联系腾讯云短信技术支持(QQ:3012203387)，量大客户可以使用此功能批量拉取，其他客户不建议使用。

- **拉取单个手机短信状态**

```javascript
const beginTime = 1511125600;  // 开始时间(unix timestamp)
const endTime = 1511841600;    // 结束时间(unix timestamp)
const maxNum = 10;             // 单次拉取最大量

// 拉取短信回执
smsClient.init({
    action: 'SmsMobileStatusPullCallback',
    data: {
        nationCode: '86',
        phoneNumber,
        beginTime,
        endTime,
        maxNum
    }
}).then((res) => {
    // 处理结果
});

// 拉取回复
smsClient.init({
    action: 'SmsMobileStatusPullReply',
    data: {
        nationCode: '86',
        phoneNumber,
        beginTime,
        endTime,
        maxNum
    }
}).then((res) => {
    // 处理结果
});
```

> `Note` 短信拉取功能需要联系腾讯云短信技术支持(QQ:3012203387)，量大客户可以使用此功能批量拉取，其他客户不建议使用。

- **发送海外短信**

海外短信与国内短信发送类似, 发送海外短信只需替换相应国家码。


- **上传语音文件**

```javascript
var fs = require("fs");

// Note: 语音文件大小上传限制400K字节
const filePath = "/home/pf/data/download/scripts/voice/4162.mp3";
const fileContent = fs.readFileSync(filePath);

smsClient.init({
    action: 'VoiceFileUpload',
    data: {
        fileContent
    }
}).then((res) => {
    // 上传成功后，res里会返回语音文件的fid
});
```

> `Note` '语音文件上传'功能需要联系腾讯云短信技术支持(QQ:3012203387)才能开通

- **按语音文件fid发送语音通知**

```javascript
// Note：这里fid来自`上传语音文件`接口返回的响应，要按语音
// 文件fid发送语音通知，需要先上传语音文件获取fid
const fid = "c799d10a43ec109f02f2288ca3c85b79e7700c98.mp3";
smsClient.init({
    action: 'FileVoiceSend',
    data: {
        nationCode: '86',
        phoneNumber,
        fid,
    }
}).then((res) => {
    // 处理结果
});
```

> `Note` 按'语音文件fid发送语音通知'功能需要联系腾讯云短信技术支持(QQ:3012203387)才能开通

- **指定模板发送语音通知**

```javascript
smsClient.init({
    action: 'TtsVoiceSend',
    data: {
        nationCode: '86',
        phoneNumber,
        templId,
        params: ['5678']
    }
}).then((res) => {
    // 处理结果
});
```
