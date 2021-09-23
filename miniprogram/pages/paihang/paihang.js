// pages/paihang/paihang.js
const app = getApp();
const db = wx.cloud.database();
const _ = db.command;
const $ = db.command.aggregate;
Page({

  /**
   * 页面的初始数据
   */
  data: {
       list:[],
       option1: [
        { text: '日排行', value: 0 },
        { text: '周排行', value: 1 },
        { text: '月排行', value: 2 },
        { text: '年排行', value: 3 },
      ],
      option2: [
        { text: '佣金排序', value: 'a' },
        { text: '速度排序', value: 'b' },
      ],
      value1: 0,
      value2: 'a',
      renzheng:'',
      mingci:'',
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
        let that = this;
        console.log(options)
        that.setData({
           renzheng:options.id
        })
        that.get_paihang();
  },
  time_change:function(event){
    let that = this;
    console.log(event)
    that.setData({
      value1:event.detail,
    })
    console.log(that.data.value1)
  },
  paixu_change:function(event){
    let that = this;
    console.log(event)
    that.setData({
      value2:event.detail,
    })
    console.log(that.data.value2)
  },
  time_close:function(){
    let that = this;
    //日佣金排序
    if(that.data.value1==0&&that.data.value2=='a'){
        let luyou = 'get_riyong'
        that.get_shuju(luyou);
    }
    //周佣金排序
    if(that.data.value1==1&&that.data.value2=='a'){
        let luyou = 'get_zhouyong'
        that.get_shuju(luyou);
    }
    //月佣金排序
    if(that.data.value1==2&&that.data.value2=='a'){
        let luyou = 'get_yueyong'
        that.get_shuju(luyou);
    }
    //年佣金排序
    if(that.data.value1==3&&that.data.value2=='a'){
        let luyou = 'get_nianyong'
        that.get_shuju(luyou);
    }

     //日速度排序
     if(that.data.value1==0&&that.data.value2=='b'){
        let luyou = 'get_risu'
        that.get_shuju(luyou);
    }
    //周速度排序
    if(that.data.value1==1&&that.data.value2=='b'){
        let luyou = 'get_zhousu'
        that.get_shuju(luyou);
    }
    //月速度排序
    if(that.data.value1==2&&that.data.value2=='b'){
        let luyou = 'get_yuesu'
        that.get_shuju(luyou);
    }
    //年速度排序
    if(that.data.value1==3&&that.data.value2=='b'){
        let luyou = 'get_niansu'
        that.get_shuju(luyou);
    }
  },
  paixu_close:function(){
    let that = this;
    that.time_close();
  },
  get_shuju:function(event){
      let that = this;
      wx.showLoading({
        title: '正在获取',
      })
      wx.cloud.callFunction({
        name:'get_paihang',
        data:{
          $url: event, //云函数路由参数
        },
        success:function(res){
              console.log(res)
              that.setData({
                 list:res.result.list,
              })
              for(let i = 0;i<that.data.list.length;i++){
                if(that.data.list[i]._id._openid==app.globalData.openid){
                    that.setData({
                       mingci:i,
                    })
                }
              }
              wx.hideLoading()
        },
        fail(er){
            console.log(er)
            wx.hideLoading()
            wx.showToast({
              title: '获取失败，请重试',
              icon: 'none',
              duration: 2000
            })
        }
      })
  },
  get_paihang:function(){
    let that = this;
    wx.showLoading({
      title: '正在获取',
    })
      wx.cloud.callFunction({
        name:'get_paihang',
        data:{
          $url: "get_riyong", //云函数路由参数
        },
        success:function(res){
              console.log(res)
              that.setData({
                 list:res.result.list,
              })

              for(let i = 0;i<that.data.list.length;i++){
                  if(that.data.list[i]._id._openid==app.globalData.openid){
                      that.setData({
                         mingci:i,
                      })
                  }
              }
              wx.hideLoading()
        },
        fail(er){
            console.log(er)
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