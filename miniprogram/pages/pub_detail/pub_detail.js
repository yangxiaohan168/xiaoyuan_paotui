// pages/pub_detail/pub_detail.js
const app = getApp();
const db = wx.cloud.database();
Page({

  /**
   * 页面的初始数据
   */
  data: {
        info:'',
        jiujin:'就近购买',
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
      let that = this;
      wx.showLoading({
        title: '正在获取',
      })
      that.get_xinxi(options.id);
  },
    //预览图片
    previewImage:function(event){
      let that = this;
      console.log(event)
      wx.previewImage({
        urls: [event.currentTarget.dataset.url] // 需要预览的图片http链接列表
      })    
    },
  yulan_img:function(e){
    let that = this;
    let img = e.currentTarget.dataset.img
    wx.previewImage({
      urls: [img],
    })
  },
  xiazai:function(e){
    let that = this;
    let url = e.currentTarget.dataset.url;
    //下载文件
    wx.cloud.downloadFile({
      fileID: url,
      success: res => { 
        console.log("文件下载成功",res);
        //打开文件
        const filePath = res.tempFilePath
       
        wx.showModal({
          title: '提示',
          content: '下载成功，请打开另存',
          showCancel:false,
          confirmText:'前往另存',
          success (res) {
            if (res.confirm) {
              console.log('用户点击确定')
              wx.openDocument({
                filePath: filePath,
                success: function (re) {
                  console.log('文件打开成功',re)
                }
              })
            } else if (res.cancel) {
              console.log('用户点击取消')
            }
          }
        })
        
        
      }
    })
  },
  da_dianhua:function(e){
    let that = this;
    console.log(e)
    let phone = e.currentTarget.dataset.phone
    wx.makePhoneCall({
      phoneNumber: phone,
    })
    
  },
  get_xinxi:function(e){
    let that = this;
    db.collection('publish').doc(e).get({
      success:function(res){
            console.log(res)
            wx.hideLoading()
            that.setData({
               info:res.data
            })
      },
      fail(er){
            wx.hideLoading()
            wx.showToast({
              title: '获取失败，请重试',
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