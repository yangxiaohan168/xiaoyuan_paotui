// pages/recharge/recharge.js
const app = getApp();
const db = wx.cloud.database();
Page({

  /**
   * 页面的初始数据
   */
  data: {
       num:'',
       user_id:'',
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
        
  },
   //金额输入，因为js对小数乘除很容易出问题，所以干脆就取整
   numInput(e) {
     let that = this;
     that.setData({
        num:e.detail.value
     })
   },
   check:function(){
     let that = this;
     if(!/^\+?[1-9][0-9]*$/.test(that.data.num)){
      wx.showToast({
        title: '充值金额必须为非零的正整数',
        icon: 'none',
        duration: 2000
      })
      return false;
    }
    //先获取用户的_id,
    that.get_userid();

   },
   get_userid:function(){
     let that = this;
     db.collection('user').where({
        _openid:app.globalData.openid,
     }).get({
       success:function(res){
            that.setData({
               user_id:res.data[0]._id,
            })
            //开始支付
            that.pay();
           
       },
       fail(er){
          wx.showToast({
            title: '获取错误，请重试',
            icon: 'none',
            duration: 2000
          })
       }
     })
     
   },
   //使用微信支付
  pay:function(){
    let that = this;
    wx.showLoading({
      title: '正在支付',
    })
    let dingdan_hao = Date.now().toString()+Math.floor(Math.random()*1000).toString()
    wx.cloud.callFunction({
      name: 'pay',  //云函数的名称，在后面我们会教大家怎么建
      data:{
          body:'优我帮-钱包充值',
          outTradeNo:dingdan_hao,
          totalFee:that.data.num,
          nonceStr:'5K8264ILTKCH16CQ2502SI8ZNMTM67VS'
      },
      success: res => {
        console.log(res)
        const payment = res.result.payment
        wx.hideLoading();
        wx.requestPayment({
          ...payment,           //...这三点是 ES6的展开运算符，用于对变量、数组、字符串、对象等都可以进行解构赋值。
          success (res) {
            console.log('支付成功', res)
            wx.showLoading({
              title: '正在完成',
            })
            //支付成功后，要写一个事务，
            //第一是增加用户的余额，第二是再添加充值记录到history数据库
            that.affair();
            let nian = new Date().getFullYear();
            let yue = new Date().getMonth()+1;
            let ri = new Date().getDate();
            let shi = new Date().getHours();
            let fen = new Date().getMinutes();
            //支付成功后，调用paysuc云函数发布订单支付成功提醒
            wx.cloud.callFunction({
              name:'paysuc',
              data:{
                trade_name:'优我帮-钱包充值',
                cost:(that.data.num).toString(),   //转成字符串
                payment_method:'微信支付',
                time:nian+'年'+yue+'月'+ri+'日'+' '+shi+':'+fen,
                dingdan_hao:dingdan_hao,
                
              },
              success:function(re){
                   console.log(re)
              },
              fail(e){
                 console.log(e)
              }
            })

          },
          fail (err) {
            console.error('支付失败', err) //支付失败之后的处理函数，写在这后面

          }
        })
      },
      fail: console.error,
    })
  },
  //请求获取发送订阅消息的权限
  subscribeMessage() {
    let that = this;
    wx.requestSubscribeMessage({
      tmplIds: [
        "HtZ_mS0WpFwT8AQAE72xrDKFWWoIle5OzJ83VYfwu5E",//订阅消息模板ID，一次可以写三个，可以是同款通知、到货通知、新品上新通知等，通常用户不会拒绝，多写几个就能获取更多授权
      ],
      success(res) {
        console.log("订阅消息API调用成功：",res)
        //开始检查输入值
        that.check();
        
      },
      fail(res) {
        console.log("订阅消息API调用失败：",res)
        wx.showToast({
          title: '请授权发送支付提醒才能钱包充值',
          icon: 'none',
          duration: 2000
        })
      }
    })
  },
  //调用云函数来处理事务
  affair:function(){
    let that = this;
    wx.cloud.callFunction({
      name:'recharge',
      data:{
        user_id:that.data.user_id,
        cost:that.data.num,
        name:'钱包充值',
        stamp:new Date().getTime(),
      },
      success:function(res){
           wx.hideLoading()
           console.log(res)
           //成功，则一秒后返回上一级页面
           if(res.result.success){
                wx.showToast({
                  title: '充值成功',
                  icon: 'success',
                  duration: 2000
                })
                setTimeout(function(){
                    wx.navigateBack({
                      delta: 0,
                    })
                },1000)
           }
           //如果失败，则提示重试
           if(!res.result.success){
             wx.showToast({
               title: '充值错误，请重试',
               icon: 'none',
               duration: 2000
             })
           }
      },
      fail(er){
         wx.hideLoading()
         //调用云函数失败
         wx.showToast({
          title: '调用错误，请重试',
          icon: 'none',
          duration: 2000
        })
      }
    })
  },
  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {

  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {

  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {

  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {

  }
})