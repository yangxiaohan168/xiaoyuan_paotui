// pages/reflect/reflect.js
const app = getApp();
const db = wx.cloud.database();
Page({

  /**
   * 页面的初始数据
   */
  data: {
       
       phone:'',
       balance:0,
       user_id:'',

  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
      let that = this;
      that.get_balance();
  },
  check:function(){
      let that = this;
      
      if(!/^1[34578]\d{9}$/.test(that.data.phone)){
          wx.showToast({
            title: '请输入正确的手机号码',
            icon: 'none',
            duration: 2000
          })
          return false;
      }
      //开始提现,第一要把钱包余额归零，第二是写入history数据库表，第三是添加提现记录到tixian表里
      that.tixian();
  },
  tixian:function(){
    let that = this;
    wx.showLoading({
      title: '正在提现',
    })
    let nian = new Date().getFullYear();
    let yue = new Date().getMonth()+1;
    let ri = new Date().getDate();
    let shi = new Date().getHours();
    let fen = new Date().getMinutes();
    wx.cloud.callFunction({
          name:'tixian',
          data:{
            user_id:that.data.user_id,
            balance:that.data.balance,
            phone:that.data.phone,
            tixian_time:nian+'年'+yue+'月'+ri+'日'+' '+shi+':'+fen,
            name:'提现',
            stamp:new Date().getTime(),
            cost:that.data.balance,
          },
          success:function(res){
            wx.hideLoading()
            wx.showToast({
              title: '提现成功',
              icon: 'success',
              duration: 2000
            })
            setTimeout(function(){
              wx.navigateBack({
                delta: 0,
              })
            },1000)
          },
          fail(er){
            wx.hideLoading()
            wx.showToast({
              title: '提现失败，请重试',
              icon: 'none',
              duration: 2000
            })
          }
    })
  },



  phoneInput:function(event){
    let that = this;
    console.log(event)
    that.setData({
       phone:event.detail.value,
    })
    console.log(that.data.phone)
  },
  //获取用户余额
  get_balance:function(){
    let that = this;
    wx.showLoading({
      title: '正在获取',
    })
    db.collection('user').where({
        _openid:app.globalData.openid,
    }).get({
      success:function(res){
           console.log(res)
           wx.hideLoading()
           that.setData({
              balance:res.data[0].balance,
              user_id:res.data[0]._id,
           })
      },
      fail(er){
          console.log(res)
          wx.hideLoading()
          wx.showToast({
            title: '获取失败，请重新获取',
            icon: 'none',
            duration: 2000
          })
          setTimeout(function(){
            wx.navigateBack({
              delta: 0,
            })
          },1000)
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