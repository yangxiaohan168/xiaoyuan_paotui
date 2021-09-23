const cloud = require('wx-server-sdk')
cloud.init({
  env: '填入您的环境ID'
})

exports.main = async (event, context) => {
  const res = await cloud.cloudPay.unifiedOrder({
    "body": event.body,
    "outTradeNo" : event.outTradeNo, //不能重复，否则报错
    "spbillCreateIp" : "127.0.0.1", //就是这个值，不要改
    "subMchId" : "填入您的商户ID",  //你的商户ID或子商户ID,
    "totalFee" : parseInt(event.totalFee)*100,  //单位为分
    "envId": "填入您的环境ID",  //你的云开发环境ID
    "functionName": "paysuc",  //支付成功的回调云函数
    "nonceStr":event.nonceStr,  //随便弄的32位字符串，建议自己生成
    "tradeType":"JSAPI"   //默认是JSAPI
  })
  return res
}