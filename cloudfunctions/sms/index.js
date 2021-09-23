// 云函数入口文件
const cloud = require('wx-server-sdk')
const {
  SmsClient
} = require('sms-node-sdk');


const AppID = 1400572795;  // SDK AppID是1400开头

// 短信应用SDK AppKey ，替换为你自己的 AppKey
const AppKey = '9cb17922dc1d66986e0d11e5ec9c384b';

// 短信模板ID，需要在短信应用中申请
const templId = 1118786;
// 签名，替换为你自己申请的签名
const smsSign = '优我帮';

// 实例化smsClient

cloud.init();

// 云函数入口函数
exports.main = async (event, context) => {
  let ke_phone = event.ke_phone;
  let jie_phone = event.jie_phone;
  let smsClient = new SmsClient({ AppID, AppKey });
  return await smsClient.init({
    action: 'SmsSingleSendTemplate',
    data: {
      nationCode: '86',
      phoneNumber:ke_phone,
      templId: templId,
      params: [jie_phone],
      sign: smsSign // 签名参数未提供或者为空时，会使用默认签名发送短信
    }
  })
}