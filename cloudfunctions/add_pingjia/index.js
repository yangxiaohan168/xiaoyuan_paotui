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
      if (publishRes.data) {
        const updatepublishRes = await transaction.collection('publish').doc(event.publish_id).update({
          data: {
              pingjia:true,
          }
        })
        const updatepingjiaRes = await transaction.collection('pingjia').add({
          data: {
               _openid:event.jie_openid,
                notes:event.notes,
                value:event.value,
                creat:event.creat,
                avatarUrl:event.avatarUrl,
                nickName:event.nickName,
                jiedan_avatarUrl:event.jiedan_avatarUrl,
                jiedan_name:event.jiedan_name,
                jiedan_phone:event.jiedan_phone,
                time:event.time,
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