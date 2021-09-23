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
      const publishRes = await transaction.collection('publish').doc(event._id).get()
      
      if (publishRes.data) {

        const updatepublishRes = await transaction.collection('publish').doc(event._id).update({
          data: {
              state:2,   //变为已接单
          }
        })

        const updateorderRes = await transaction.collection('order').add({
          data: {
               _openid:cloud.getWXContext().OPENID,
               jiedan_name:event.jiedan_name,
               jiedan_phone:event.jiedan_phone,
               jiedan_avatarUrl:event.jiedan_avatarUrl,
                jiedan_userInfo:event.jiedan_userInfo,
                jiedan_nickName:event.jiedan_nickName,
               creat:event.creat,
               cost:parseFloat(event.cost),
               publish_id:event._id,
               category:1,
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