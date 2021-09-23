const cloud = require('wx-server-sdk')
cloud.init({
  env: '填入您的环境ID'
})

exports.main = async (event, context) => {
  const {cashFee,subOpenid,outTradeNo,timeEnd} = event
  try {
    const result = await cloud.openapi.subscribeMessage.send({
      touser: cloud.getWXContext().OPENID,
      page: 'index',
      templateId: "填入您申请的订阅消息templateId",
      data: {
        "thing2": {
          "value": event.trade_name
        },
        "amount3": {
          "value": event.cost +'元'
        },
        "phrase4": {
          "value": event.payment_method
        },
        "date5": {
          "value": event.time
        },
        "character_string6": {
          "value": event.dingdan_hao
        }
    }
    })
    return result
  } catch (err) {
    console.log(err)
    return err
  }
}