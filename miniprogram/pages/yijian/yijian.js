// pages/yijian/yijian.js
const app = getApp();
const db = wx.cloud.database();
Page({

  /**
   * 页面的初始数据
   */
  data: {
    notes:'',
    note_counts:0,
    userInfo:'',
    avatarUrl:'',
    nickName:'',
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {

  },
  getUserProfile(e) {
    // 推荐使用wx.getUserProfile获取用户信息，开发者每次通过该接口获取用户个人信息均需用户确认
    // 开发者妥善保管用户快速填写的头像昵称，避免重复弹窗
    let that = this;
    if(that.data.userInfo!==''){
          that.check();
    }
    if(that.data.userInfo==''){
          wx.getUserProfile({
                desc: '用于完善用户资料', // 声明获取用户个人信息后的用途，后续会展示在弹窗中，请谨慎填写
                success: (res) => {
                      that.setData({
                         userInfo: res.userInfo,
                         avatarUrl:res.userInfo.avatarUrl,
                         nickName:res.userInfo.nickName,
                      })
                      
                      that.check();
                },
                fail(){
                      wx.showToast({
                            title: '请授权后方可使用',
                            icon: 'none',
                            duration: 2000
                      });
                }
          })
    }
    
},
check:function(){
  let that = this;
  if(that.data.notes==''){
    wx.showToast({
      title: '请输入您的宝贵意见',
      icon: 'none',
      duration: 2000
     })
     return false;
  }
  that.add_yijian();

},
add_yijian:function(){
  let that = this;
  wx.showLoading({
    title: '正在提交',
  })
  let nian = new Date().getFullYear();
    let yue = new Date().getMonth()+1;
    let ri = new Date().getDate();
    let shi = new Date().getHours();
    let fen = new Date().getMinutes();
  db.collection('yijian').add({
    data:{
       avatarUrl:that.data.avatarUrl,
       nickName:that.data.nickName,
       notes:that.data.notes,
       time:nian+'年'+yue+'月'+ri+'日'+' '+shi+':'+fen,
    },
    success:function(res){
      wx.hideLoading()
      wx.showToast({
        title: '提交成功',
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
      console.log(er)
      wx.hideLoading()
      wx.showToast({
            title: '失败，请重试',
            icon: 'none',
            duration: 2000
      })
    }
  })
},
   //获取用户输入的意见
   noteInput(e){
    let that = this;
    console.log(e.detail.cursor)
    that.setData({
          note_counts: e.detail.cursor,
          notes: e.detail.value,
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