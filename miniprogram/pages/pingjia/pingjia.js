// pages/pingjia/pingjia.js
Page({

  /**
   * 页面的初始数据
   */
  data: {
       publish_id:'',
       value:3,
       jie_openid:'',
       notes:'',
       note_counts:0,
       userInfo: '',
      avatarUrl:'',
      nickName:'',
      jiedan_avatarUrl:'',
      jiedan_name:'',
      jiedan_phone:'',
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
      let that = this;
      that.get_jieopenid(options.publish_id);
      that.setData({
          publish_id:options.publish_id,
      })
  },
  check:function(){
    let that = this;
    if(that.data.notes==''){
      wx.showToast({
        title: '请输入评价',
        icon: 'none',
        duration: 2000
       })
       return false;
    }
    that.add_pingjia();

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
  //评价要做的三件事
  //第一件是添加评价记录到评价表里，第二件是更新publish的字段pingjia为true，表示已评价

  add_pingjia:function(){
    let that = this;
    wx.showLoading({
      title: '正在提交',
    })
    let nian = new Date().getFullYear();
    let yue = new Date().getMonth()+1;
    let ri = new Date().getDate();
    let shi = new Date().getHours();
    let fen = new Date().getMinutes();
    wx.cloud.callFunction({
      name:'add_pingjia',
      data:{
          jie_openid:that.data.jie_openid,
          publish_id:that.data.publish_id,
          notes:that.data.notes,
          value:that.data.value,
          creat:new Date().getTime(),
          avatarUrl:that.data.avatarUrl,
          nickName:that.data.nickName,
          jiedan_avatarUrl:that.data.jiedan_avatarUrl,
          jiedan_name:that.data.jiedan_name,
          jiedan_phone:that.data.jiedan_phone,
          time:nian+'年'+yue+'月'+ri+'日'+' '+shi+':'+fen,
      },
      success:function(res){
        if(res.result.success){
          wx.hideLoading()
          wx.showToast({
            title: '评价成功',
            icon: 'success',
            duration: 2000
          })
          setTimeout(function(){
            wx.navigateBack({
              delta: 0,
            })
          },1000)

            
            
        }
        if(!res.result.success){
              wx.hideLoading()
              wx.showToast({
                    title: '失败，请重试',
                    icon: 'none',
                    duration: 2000
              })
        }
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
  
    //获取用户输入的评价
    noteInput(e){
      let that = this;
      console.log(e.detail.cursor)
      that.setData({
            note_counts: e.detail.cursor,
            notes: e.detail.value,
      })
    },
  //获取跑腿员的openid
  get_jieopenid:function(e){
      let that = this;
      wx.showLoading({
        title: '正在获取',
      })
      wx.cloud.callFunction({
        name:'get_jiePhone',
        data:{
          id:e
        },
        success:function(res){
            console.log(res)
            let jie_openid = res.result.list[0].List[0]._openid
            let jiedan_avatarUrl = res.result.list[0].List[0].jiedan_avatarUrl
            let jiedan_name = res.result.list[0].List[0].jiedan_name
            let jiedan_phone = res.result.list[0].List[0].jiedan_phone
            

            //获得接单者_openid之后，保存到data里面去，点击评价的时候需要用到
            that.setData({
               jie_openid:jie_openid,
               jiedan_avatarUrl:jiedan_avatarUrl,
               jiedan_name:jiedan_name,
               jiedan_phone:jiedan_phone,
            })
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
             //返回重试
             setTimeout(function(){
               wx.navigateBack({
                 delta: 0,
               })
             },1000)
        }
      })
  },
  //获取用户选择的星级
  onChange(event) {
    let that = this;
    that.setData({
      value: event.detail,
    });
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