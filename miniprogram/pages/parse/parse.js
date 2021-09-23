// pages/parse/parse.js
const app = getApp();
const db = wx.cloud.database();

Page({

  /**
   * 页面的初始数据
   */
  data: {
        balance:0,
        list:[],
        nomore:false,
        page:0,
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
       let that = this;
       //第一次进来我的钱包，首先要查询user表是否有这个人，没有则要添加
       //避免发布订单用到parse字段而出错
       that.get_balance();
       //获取消费记录
       that.get_history();
  },
  get_morehistory:function(){
    let that = this;
    if (that.data.nomore || that.data.list.length < 20) {
      wx.showToast({
        title: '没有更多了',
      })
      return false;
    }
    let page = that.data.page + 1;
      //经过上一句执行，page的值已经为1了，所以下面的page*20=20，下标20就是第21条记录
      db.collection('history').where({
        _openid:app.globalData.openid,
      }).orderBy('stamp', 'desc').skip(page * 20).limit(20).get({
            success: function(res) {
                  console.log(res)
                  if (res.data.length == 0) {
                        that.setData({
                              nomore: true
                        })
                  }
                  if (res.data.length < 20) {
                        that.setData({
                              nomore: true
                        })
                        //取到成功后，都连接到旧数组，然后组成新数组
                        that.setData({
                              //这里的page为1
                              page: page,
                              list: that.data.list.concat(res.data)
                        })
                  }  
            },
            fail() {
                  wx.showToast({
                        title: '获取失败',
                        icon: 'none'
                  })
            }
      })
  },
  //获取消费记录
  get_history:function(){
    let that = this;
    db.collection('history').limit(20).orderBy('stamp','desc').where({
      _openid:app.globalData.openid,
    }).get({
      success:function(res){
            that.setData({
               list:res.data,
            })
      },
      fail(er){
        wx.showToast({
          title: '获取错误，请重试',
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
  //获取余额
  get_balance:function(){
    let that = this;
    db.collection('user').where({
       _openid:app.globalData.openid,
    }).get({
      success:function(res){
        console.log(res)
        //用户不存在于user表里，则添加
        if(res.data.length==0){
            db.collection('user').add({
                  data:{
                    balance:0,
                  },
                  success:function(r){
                      console.log('添加balance字段成功')
                      //成功添加，不做任何处理
                  },
                  fail(){
                      // 不成功，就退出此页面，防止使用钱包支付时候出错
                      wx.showToast({
                        title: '添加错误，请重试',
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
        }
        //用户存在于user表里
        if(res.data.length!==0){
          console.log(res.data[0].balance)
          that.setData({
              balance:res.data[0].balance,
          })
        }
      }
   })
  },
  go:function(e){
     let that = this;
     wx.navigateTo({
       url: e.currentTarget.dataset.go,
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
       //实时更新钱的数值
       that.get_balance();
       //实时更新钱记录
       that.get_history();
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
      let that = this;
      that.get_morehistory()
  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {

  }
})