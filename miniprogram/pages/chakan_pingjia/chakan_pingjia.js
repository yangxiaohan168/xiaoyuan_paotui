// pages/chakan_pingjia/chakan_pingjia.js
const app = getApp();
const db = wx.cloud.database();
Page({

  /**
   * 页面的初始数据
   */
  data: {
      list:[],
      nomore:false,
      page:0,
      jie_openid:'',
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    let that = this;
    if(options.publish_id){
      console.log('进publish_id')
      that.get_jieopenid(options.publish_id);
      wx.setNavigationBarTitle({
        title: '该跑腿员的评价记录'
      })
    }
    if(options.openid){
      console.log('进openid')
      that.setData({
        jie_openid:options.openid,
      })
      that.get_list(options.openid)
      wx.setNavigationBarTitle({
        title: '客户评价'
      })
    }
    
    
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
        that.setData({
          jie_openid:jie_openid,
        })
        that.get_list(jie_openid);

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
get_list:function(e){
  let that = this;
  db.collection('pingjia').where({
     _openid:e,
  }).orderBy('creat', 'desc').limit(20).get({
    success:function(res){
          console.log(res)
          that.setData({
            list:res.data,
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
  more:function(){
    let that = this;
    if (that.data.nomore || that.data.list.length < 20) {
      wx.showToast({
        title: '没有更多了',
      })
      return false
    }
    let page = that.data.page + 1;
      //经过上一句执行，page的值已经为1了，所以下面的page*20=20
      db.collection('pingjia').where({
            _openid:that.data.jie_openid,
      }).orderBy('creat', 'desc').skip(page * 20).limit(20).get({
            success: function(res) {
                  if (res.data.length == 0) {
                        that.setData({
                              nomore: true
                        })
                        return false;
                  }
                  if (res.data.length < 20) {
                        that.setData({
                              nomore: true
                        })
                  }
                  //取到成功后，都连接到旧数组，然后组成新数组
                  that.setData({
                        //这里的page为1，即新页面
                        page: page,
                        list: that.data.list.concat(res.data)
                  })
            },
            fail() {
                  wx.showToast({
                        title: '获取失败',
                        icon: 'none'
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
     let that = this;
     that.more();
  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {

  }
})