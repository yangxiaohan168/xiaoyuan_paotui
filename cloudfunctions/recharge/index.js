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
      const userRes = await transaction.collection('user').doc(event.user_id).get()
      console.log(userRes)
      if (userRes.data) {

        const updateuserRes = await transaction.collection('user').doc(event.user_id).update({
          data: {
            balance: userRes.data.balance + parseInt(event.cost),
          }
        })

        const updatehistoryRes = await transaction.collection('history').add({
          data: {
               _openid:cloud.getWXContext().OPENID,
               name:event.name,
               stamp:event.stamp,
               num:parseInt(event.cost),
               type:1, //0表示钱包减少，1表示钱包增加
          }
        })
        return {
          balance: userRes.data.balance + parseInt(event.cost),
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