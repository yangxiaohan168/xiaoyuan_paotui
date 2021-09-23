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
      const orderRes = await transaction.collection('order').doc(event.order_id).get()
      if (publishRes.data&&orderRes.data) {

        const updatepublishRes = await transaction.collection('publish').doc(event.publish_id).update({
          data: {
              state:5,   //变为待确认
              order_id:event.order_id  //存入publish，方便客户修改接单员的订单状态
          }
        })

        const updateorderRes = await transaction.collection('order').doc(event.order_id).update({
          data: {
               songda_time:event.songda_time,
               zong_time:event.zong_time,
               category:4,
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