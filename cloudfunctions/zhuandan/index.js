const cloud = require('wx-server-sdk')
cloud.init({
  env: 'cloud1-7gfkdvn4d13b54c9'
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
              state:1,   //又变为待接单
          }
        })

        const updateorderRes = await transaction.collection('order').doc(event.order_id).update({
          data: {
               category:3,   //变为已转单
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