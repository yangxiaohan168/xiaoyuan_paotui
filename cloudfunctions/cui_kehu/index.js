const cloud = require('wx-server-sdk')
cloud.init({
  env: 'cloud1-7gfkdvn4d13b54c9'
})
const {
  SmsClient
} = require('sms-node-sdk');


const AppID = 1400572795;  // SDK AppID是1400开头

// 短信应用SDK AppKey ，替换为你自己的 AppKey
const AppKey = '9cb17922dc1d66986e0d11e5ec9c384b';

// 短信模板ID，需要在短信应用中申请
const templId = 1119678;
// 签名，替换为你自己申请的签名
const smsSign = '优我帮';

const db = cloud.database({
  throwOnNotFound: false,
});
exports.main = async (event) => {
  try {
    const result = await db.runTransaction(async transaction => {
      const orderRes = await transaction.collection('order').doc(event.order_id).get()
      
      if (orderRes.data) {

        const updateorderRes = await transaction.collection('order').doc(event.order_id).update({
          data: {
              cui:true,  //变为已催过
          }
        })
        
        let ke_phone = event.ke_phone;
        let smsClient = new SmsClient({ AppID, AppKey });
        await smsClient.init({
          action: 'SmsSingleSendTemplate',
          data: {
            nationCode: '86',
            phoneNumber:ke_phone,
            templId: templId,
            params: [],
            sign: smsSign // 签名参数未提供或者为空时，会使用默认签名发送短信
          }
        })
        
        return {
          success:true,
        }
      } else {
        await transaction.rollback('失败了')
      }
    })
    return result;
  } catch (e) {
    console.error(`事务报错`, e)
    return {
      success: false,
      error: e
    }
  }
}