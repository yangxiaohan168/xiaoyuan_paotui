const cloud = require('wx-server-sdk')
cloud.init({
  env: '填入您的环境ID'
})
const db = cloud.database({
  throwOnNotFound: false,
});
exports.main = async (event) => {
  try {
    const result = await db.runTransaction(async transaction => {
      const publishRes = await transaction.collection('publish').doc(event.publish_id).get()
      
      const userRes = await transaction.collection('user').doc(event.user_id).get()
      if (publishRes.data&&userRes.data) {

        const updatepublishRes = await transaction.collection('publish').doc(event.publish_id).update({
          data: {
              state:3,   //变为已完成
          }
        })
        const updateorderRes = await transaction.collection('order').doc(event.order_id).update({
          data: {
               category:2,   //把接单者的待确认改为已完成
          }
        })
        let cost = (userRes.data.balance + event.cost).toFixed(1)
        let costjia = parseFloat(cost)
        const updateuserRes = await transaction.collection('user').doc(event.user_id).update({
          data: {
              balance:costjia,
          }
        })

        const updatehistoryRes = await transaction.collection('history').add({
          data: {
               _openid:event.jie_openid,
               name:event.name,
               stamp:event.stamp,
               num:parseFloat(event.cost),
               type:1, //0表示钱包减少，1表示钱包增加
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