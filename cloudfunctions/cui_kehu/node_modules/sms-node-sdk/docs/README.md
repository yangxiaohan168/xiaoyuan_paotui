# SDK 文档

## new SmsClient

* `AppID` 短信应用 AppID
* `AppKey` 短信用应 AppKey

```js
const AppID = '1400009099';
const AppKe = '9ff91d87c2cd7cd0ea762f141975d1df37481d48700d70ac37470aefc60f9bad';
const {
    SmsClient
} = require('sms-node-sdk');

let smsClient = new SmsClient({ AppID, AppKey });
```

## init

* 入参

| 字段 | 类型 | 必填 | 说明
| --- | --- | --- | ---
| action | string | 是 | 使用功能
| data | object | 是 | 具体参数

* 返回 `Promise`

* 示例
```js
smsClient.init({
    action: 'SmsSingleSend',
    data: {
        msgType: 0,
        nationCode: '86',
        phoneNumber: '12342442467',
        msg: '【腾讯云】您的验证码是: 5678！'
    }
}).then((res) => {
    // 处理结果
});
```

## action 与 data 具体对照表

### 单发短信
* action 值为 `SmsSingleSend`

* data 参数

| 字段 | 类型 | 必填 | 说明
| --- | --- | --- | ---
| msgType | integer | 是 | 短信类型，0 为普通短信，1为营销短信
| nationCode | string | 是 | 国家区号
| phoneNumber | string | 是 | 电话号码
| msg | string | 是 | 短信内容
| extend | string | 是 | 扩展参数，默认为空字符串，如果用户回复了， 里面数字的会原样返回的
| ext | string | 是 | 扩展参数，默认为空字符串，返回包时，服务器会把ext原样返回

### 单发短信-指定模板id
* action 值为 `SmsSingleSendTemplate`

* data 参数

| 字段 | 类型 | 必填 | 说明
| --- | --- | --- | ---
| msgType | integer | 是 | 短信类型，0 为普通短信，1为营销短信
| nationCode | string | 是 | 国家区号
| phoneNumber | string | 是 | 电话号码
| templId | string | 是 | 通过审核的模板 id
| params | string | 是 | 模板参数
| sign | string | 是 | 短信签名，如果为空则使用默认的
| extend | string | 是 | 扩展参数，默认为空字符串，如果用户回复了， 里面数字的会原样返回的
| ext | string | 是 | 扩展参数，默认为空字符串，返回包时，服务器会把ext原样返回

### 群发短信
* action 值为 `SmsMultiSend`

* data 参数

| 字段 | 类型 | 必填 | 说明
| --- | --- | --- | ---
| nationCode | string | 是 | 国家区号
| phoneNumbers | array | 是 | 电话号码数组
| msg | string | 是 | 短信内容
| extend | string | 是 | 扩展参数，默认为空字符串，如果用户回复了， 里面数字的会原样返回的
| ext | string | 是 | 扩展参数，默认为空字符串，返回包时，服务器会把ext原样返回

### 群发短信-指定模板id
* action 值为 `SmsMultiSendTemplate`

* data 参数

| 字段 | 类型 | 必填 | 说明
| --- | --- | --- | ---
| nationCode | string | 是 | 国家区号
| phoneNumbers | array | 是 | 电话号码数据
| templId | string | 是 | 通过审核的模板 id
| params | string | 是 | 模板参数
| sign | string | 是 | 短信签名，如果为空则使用默认的
| extend | string | 是 | 扩展参数，默认为空字符串，如果用户回复了， 里面数字的会原样返回的
| ext | string | 是 | 扩展参数，默认为空字符串，返回包时，服务器会把ext原样返回

### 发送语音验证码
* action 值为 `CodeVoiceSend`

* data 参数

| 字段 | 类型 | 必填 | 说明
| --- | --- | --- | ---
| nationCode | string | 是 | 国家区号
| phoneNumber | string | 是 | 电话号码
| msg | string | 是 | 验证码数字
| playtimes | integer | 是 | 重读次数，默认为2次，最多为3次
| ext | string | 是 | 扩展参数，默认为空字符串，返回包时，服务器会把ext原样返回

### 发送语音通知
* action 值为 `PromptVoiceSend`

* data 参数

| 字段 | 类型 | 必填 | 说明
| --- | --- | --- | ---
| nationCode | string | 是 | 国家区号
| phoneNumber | string | 是 | 电话号码
| prompttype | integer | 是 | 语音通知类型
| msg | string | 是 | 短信内容
| playtimes | integer | 是 | 重读次数，默认为2次，最多为3次
| ext | string | 是 | 扩展参数，默认为空字符串，返回包时，服务器会把ext原样返回

### 上传语音文件
* action 值为 `VoiceFileUpload`

* data 参数

| 字段 | 类型 | 必填 | 说明
| --- | --- | --- | ---
| fileContent | string | 是 | 文件内容
| contentType | string | 是 | 文件类型，类型是 mp3 或 wav

### 按语音文件fid发送语音通知
* action 值为 `FileVoiceSend`

* data 参数

| 字段 | 类型 | 必填 | 说明
| --- | --- | --- | ---
| nationCode | string | 是 | 国家区号
| phoneNumber | string | 是 | 电话号码
| fid | string | 是 | 文件 id
| playtimes | integer | 是 | 重读次数，默认为2次，最多为3次
| ext | string | 是 | 扩展参数，默认为空字符串，返回包时，服务器会把ext原样返回

### 指定模板发送语音通知
* action 值为 `TtsVoiceSend`

* data 参数

| 字段 | 类型 | 必填 | 说明
| --- | --- | --- | ---
| nationCode | string | 是 | 国家区号
| phoneNumber | string | 是 | 电话号码
| templId | string | 是 | 通过审核的模板 id
| params | string | 是 | 模板参数
| playtimes | integer | 是 | 重读次数，默认为2次，最多为3次
| ext | string | 是 | 扩展参数，默认为空字符串，返回包时，服务器会把ext原样返回

### 拉取短信回执
* action 值为 `SmsStatusPullCallback`

* data 参数

| 字段 | 类型 | 必填 | 说明
| --- | --- | --- | ---
| maxNum | integer | 是 | 最大拉取数量

### 拉取短信回复
* action 值为 `SmsStatusPullReply`

* data 参数

| 字段 | 类型 | 必填 | 说明
| --- | --- | --- | ---
| maxNum | integer | 是 | 最大拉取数量

### 拉取单个手机短信回执
* action 值为 `SmsMobileStatusPullCallback`

* data 参数

| 字段 | 类型 | 必填 | 说明
| --- | --- | --- | ---
| nationCode | string | 是 | 国家区号
| phoneNumber | string | 是 | 电话号码
| beginTime | integer | 是 | 起始时间，unix时间戳，比如：Date.now() / 1000
| endTime | integer | 是 | 结束时间，unix时间戳，比如：Date.now() / 1000
| maxNum | integer | 是 | 最大拉取数量

### 拉取单个手机短信回复
* action 值为 `SmsMobileStatusPullReply`

* data 参数

| 字段 | 类型 | 必填 | 说明
| --- | --- | --- | ---
| nationCode | string | 是 | 国家区号
| phoneNumber | string | 是 | 电话号码
| beginTime | integer | 是 | 起始时间，unix时间戳，比如：Date.now() / 1000
| endTime | integer | 是 | 结束时间，unix时间戳，比如：Date.now() / 1000
| maxNum | integer | 是 | 最大拉取数量