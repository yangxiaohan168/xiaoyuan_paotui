// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init({
  env: '填入您的环境ID'
})

const db = cloud.database();
// 云函数入口函数
exports.main = async (event, context) => {
 
    return await  db.collection('publish').aggregate()
      .match({
            _id: event.id,
      })
      .lookup({
      from: 'order',
      localField: '_id',
      foreignField: 'publish_id',
      as: 'List',
      })
       .sort({
        creat:-1,
     })
     .limit(1)
      .end()
      
 
}
