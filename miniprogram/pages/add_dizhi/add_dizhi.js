// pages/add_dizhi/add_dizhi.js
const app = getApp();
const db = wx.cloud.database();
Page({

  /**
   * 页面的初始数据
   */
  data: {
    campus:['请选择校区'],
    campus_show:false,
    choose_campus:'请选择校区',
    shoujian_name:'',
    phone:'',
    dizhi:'',
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
      let that = this;
      that.get_campus();
  },
  check:function(){
    let that = this;
    if(that.data.choose_campus=='请选择校区'){
      wx.showToast({
        title: '请选择校区',
        icon: 'none',
        duration: 2000
      })
      return false;
    }
    if(that.data.shoujian_name==''){
      wx.showToast({
        title: '请输入收货姓名',
        icon: 'none',
        duration: 2000
      })
      return false;
    }
    if(that.data.phone==''){
      wx.showToast({
        title: '请获取手机号码',
        icon: 'none',
        duration: 2000
      })
      return false;
    }
    if(that.data.dizhi==''){
      wx.showToast({
        title: '请输入详细地址',
        icon: 'none',
        duration: 2000
      })
      return false;
    }
    that.add()

  },
  add:function(){
    let that = this;
    wx.showLoading({
      title: '正在添加',
    })
    db.collection('dizhi').add({
      data:{
        campus:that.data.choose_campus,
        name:that.data.shoujian_name,
        phone:that.data.phone,
        dizhi:that.data.dizhi,
        creat:new Date().getTime(),
      },
      success:function(res){
           wx.hideLoading()
           wx.showToast({
            title: '添加成功',
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
            title: '失败，请重试',
            icon: 'none',
            duration: 2000
          })
      }
    })
  },
  //获取用户输入的收货地址
  onChange_inputlocation:function(event){
    let that = this;
    that.setData({
       dizhi:event.detail,
    })
    console.log(that.data.dizhi)
  },
  //获取手机号码
  get_phone:function(e){
    let that = this;
    console.log(e)
    wx.showLoading({
      title: '正在获取',
    })
   //调用云函数获取号码
    wx.cloud.callFunction({
      name:'opendata',
      data:{
          phone:wx.cloud.CloudID(e.detail.cloudID),
      },
      success:function(res){
          console.log(res)
          //成功获取手机号码后，赋值
          that.setData({
             phone:res.result.phone.data.phoneNumber,
          })
          //关闭正在获取的转圈
          wx.hideLoading()
      },
      fail(){
        wx.showToast({
          title: '获取失败,请重新获取',
          icon: 'none',
          duration: 2000
        })
      }
    })
  },
     //获取用户输入的收件人
     onChange_shoujian:function(event){
      let that = this;
      that.setData({
         shoujian_name:event.detail,
      })
      console.log(that.data.shoujian_name)
    },
  //打开选择校区窗口
  popup_campus:function(){
    let that = this;
    that.setData({
      campus_show:true,
    })
  },
  //监听选择校区变化
  campus_change:function(event){
       let that = this;
       console.log(event)
       that.setData({
         choose_campus:event.detail.value
       })
  },
  //取消选择校区
  campus_cancel:function(){
    let that = this;
    //关闭选择校区窗口
    that.setData({
       campus_show:false,
    })
  },
  //确定校区选择
  campus_confirm:function(){
    let that = this;
    //关闭选择校区窗口
    that.setData({
      campus_show:false,
    })
  },
 //获取校区
 get_campus:function(){
  let that = this;
  db.collection('campus').get({
     success:function(res){
       console.log(res)
       for(let i=0;i<res.data.length;i++){
            that.setData({
              campus:that.data.campus.concat(res.data[i].campus_name),
            })
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