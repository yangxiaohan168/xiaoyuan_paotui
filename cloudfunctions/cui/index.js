const cloud = require('wx-server-sdk')
cloud.init({
  env: '填入您的环境ID'
})
const {
  SmsClient
} = require('sms-node-sdk');


const AppID = 1400572795;  // 换成您的AppID， SDK AppID是1400开头,

// 短信应用SDK AppKey ，替换为你自己的 AppKey
const AppKey = '填入您的AppKey';

// 短信模板ID，需要在短信应用中申请
const templId = 1118845;  //换成您的短信模板ID，这个是催跑腿员火速配送的短信模板ID，别填错了
// 签名，替换为你自己申请的签名
const smsSign = '填入您申请的签名';    

const db = cloud.database({
  throwOnNotFound: false,
});
exports.main = async (event) => {
  try {
    const result = await db.runTransaction(async transaction => {
      const publishRes = await transaction.collection('publish').doc(event._id).get()
      
      if (publishRes.data) {

        const updatepublishRes = await transaction.collection('publish').doc(event._id).update({
          data: {
              cui:true,  //变为已催过
          }
        })
        
        let jie_phone = event.jie_phone;
        let smsClient = new SmsClient({ AppID, AppKey });
        await smsClient.init({
          action: 'SmsSingleSendTemplate',
          data: {
            nationCode: '86',
            phoneNumber:jie_phone,
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