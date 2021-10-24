// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init({
  env: '填入您的环境ID'
})

// 云函数入口函数
exports.main = async (event, context) => {
  return event;
}