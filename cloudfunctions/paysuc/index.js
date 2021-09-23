const cloud = require('wx-server-sdk')
cloud.init({
  env: 'cloud1-7gfkdvn4d13b54c9'
})

exports.main = async (event, context) => {
  const {cashFee,subOpenid,outTradeNo,timeEnd} = event
  try {
    const result = await cloud.openapi.subscribeMessage.send({
      touser: cloud.getWXContext().OPENID,
      page: 'index',
      templateId: "HtZ_mS0WpFwT8AQAE72xrDKFWWoIle5OzJ83VYfwu5E",
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