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
      const runnerRes = await transaction.collection('runner').doc(event.runner_id).get()
      
      if (runnerRes.data) {
        const updateyajinRes = await transaction.collection('tuiyajin').add({
          data: {
               avatarUrl:runnerRes.data.avatarUrl,
               name:runnerRes.data.name,
               phone:runnerRes.data.phone,
               yajin:runnerRes.data.cost,
               time:event.time,
          }
        })
        const updaterunRes = await transaction.collection('runner').doc(event.runner_id).remove({})

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