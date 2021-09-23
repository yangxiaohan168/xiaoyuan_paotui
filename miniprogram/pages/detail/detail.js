// pages/detail/detail.js
const app = getApp();
const db = wx.cloud.database();
Page({

  /**
   * 页面的初始数据
   */
  data: {
        show:1,
        url:'',
        content:'',
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
        let that = this;
        
        if(app.globalData.channel=="跑腿资讯"){
            that.setData({
              show:1,
            })
            //去查询数据库文章表，获取相应的文章数据,同时把id值传给get函数，用于条件查询
            that.get(options.id)
        }
       
        if(app.globalData.channel=="财经新闻"){
          that.setData({
            show:2,
            url:decodeURIComponent(options.id),
          })
          //以下是处理无法显示图片的问题
          that.setData({
             Url:that.data.url.replace(/<figure class="art_img_mini j_p_gallery">/g,"").replace(/\<img/gi, '<img style=max-width:90%;height:200rpx;margin-left:5%;').replace(/<p/g,'<p style=font-size:30rpx;')
          })
        }
  },
  //获取文章数据
  get:function(e){
    let that = this;
    
    db.collection('wenzhang').where({
       _id:e,
    }).get({
      success:function(res){
          //使用replace方法去替换富文本下面的各种节点，以达到插入样式的效果
          let Content = res.data[0].content.replace(/\<img/gi, '<img style=max-width:90%;height:200rpx;margin-left:5%;')
          that.setData({
              content:Content,
          })
      },
      fail(){
        //提示用户获取文章失败
        wx.showToast({
          title: '获取文章失败',
          icon: 'error',
          duration: 2000
        })
        //1秒后跳转回主页
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