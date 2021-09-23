// pages/my/my.js
const app = getApp();
const db = wx.cloud.database();
Page({

  /**
   * 页面的初始数据
   */
  data: {
      show:1,  //show等于1代表可以提交信息，等于2代表等待审核或者违规无权限，等于3代表审核成功
      renzheng:'接单认证',
      _openid:'',
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
       let that = this;
       //查询用户的接单认证状态，是否显示认证标志
       that.get();
       
  },

  //查询该用户的交押金认证状态
  get:function(){
    let that = this;
    db.collection('runner').where({
        _openid:app.globalData.openid,
    }).get({
      success:function(res){
           //还没提交信息
           if(res.data.length==0){
                //不做任何处理
           }
           if(res.data.length!==0){
              //有但还没有审核通过或者违规无权限
              if(res.data[0].pass==false){
                  that.setData({
                    show:2,
                    renzheng:'正在审核'
                  })
              }
              //有而且审核通过
              if(res.data[0].pass==true){
                 that.setData({
                   show:3,
                   renzheng:'已认证'
                 })
              }
           }
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
        let that = this;
        that.get();
        that.setData({
          _openid:app.globalData.openid
        })
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