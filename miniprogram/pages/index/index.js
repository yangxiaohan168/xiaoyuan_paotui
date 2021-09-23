// pages/index/index.js
const app = getApp();
const db = wx.cloud.database();
Page({

  /**
   * 页面的初始数据
   */
  data: {
    autoplay:true,
    circular:true,
    banner:[],
    channel:'跑腿资讯',
    list:[],//list是用来存放文章的数组
    nomore:false,
    page:0,
    tongzhi:'',
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
      let  that = this;
      wx.showLoading({
        title: '加载中',
      })
      wx.getStorage({
        key: 'openid',
        success (res) {
          console.log(res.data)
          //把缓存的openid赋给全局变量openid
          app.globalData.openid = res.data;
         
        },
        fail(er){
          console.log('第一次进来')
          //第一次进来没有这个openid缓存，可以获取存进去
          //获取用户的_openid
          that.get_openid();
        }
      })
      
      //获取文章列表
      that.get_cha()
      //获取轮播图
      that.get_banner();
      //获取公告通知
      that.get_tongzhi();
  },
  get_tongzhi:function(){
    let that = this;
    db.collection('tongzhi').limit(1).get({
      success:function(res){
           that.setData({
              tongzhi:res.data[0].tongzhi,
           })
           //关闭加载
           wx.hideLoading()
      }
    })
  },
  
  get_banner:function(){
    let that = this;
    db.collection('banner').limit(5).get({
      success:function(res){
           that.setData({
              banner:res.data,
           })
      }
    })
  },
  get_openid:function(){
     let that = this;
     //调用云函数，获取用户的_openid
     wx.cloud.callFunction({
       name:'login',     //要调用的函数名
       data:{

       },                //要传给login云函数的数据
       success:function(res){
            console.log(res.result.openid)
            app.globalData.openid = res.result.openid;
            //把openid放到缓存里面
            wx.setStorage({
              key:"openid",
              data:res.result.openid
            })
            
       },
       fail(){
           //提示用户获取openid失败
           wx.showToast({
            title: '获取openid失败',
            icon: 'none',
            duration: 2000
          })
          //获取失败，调用重载接口再试一次
          wx.reLaunch({
            url: '/pages/index/index',
          })
       }
    
     })
  },
  //监听切换导航的变化（跑腿、财经）
  onChange(event) {
    console.log(event.detail.title)
    let that = this;
    that.setData({
         channel:event.detail.title,
    })
    app.globalData.channel = event.detail.title;
    if(that.data.channel=='跑腿资讯'){
        app.globalData.channel = event.detail.title
        //去查询获取数据库的文章列表
        that.get_cha();
    }
    if(that.data.channel=='财经新闻'){
      app.globalData.channel = event.detail.title
      //通过请求第三方接口去获取财经新闻的列表
      that.get();
    }
    
  },
  //获取数据库文章列表
  get_cha:function(){
       let that = this;
       db.collection('wenzhang').orderBy('_updateTime', 'desc').limit(20).get({
         success:function(res){
              console.log(res)
              that.setData({
                list:res.data,
              })
         },
         fail(){
            //提示用户获取失败
            wx.showToast({
              title: '获取失败，请重新获取',
              icon: 'error',
              duration: 2000
            })
         }
       })
  },
  //跳转到文章详情页
  go_detail:function(e){
    let that = this;
    console.log(e.currentTarget.dataset.id)
    let content = encodeURIComponent(e.currentTarget.dataset.id)
    wx.navigateTo({
      url: '/pages/detail/detail?id='+content,
    })
  },
  //获取财经新闻，一次就获取20条，想获取更多得调用gengduo()函数
  get:function(){
    let that = this;
    wx.showLoading({
      title: '加载中',
    })
    wx.request({
      url: 'https://api.jisuapi.com/news/get',
      data:{
        channel:'财经',
        start:0,
        num:20,
        appkey:'7d48bc8b87053952'
      },
      success:function(res){
            console.log(res)
            that.setData({
               list:res.data.result.list,
            }) 
            //暂停刷新
            wx.stopPullDownRefresh();
            wx.hideLoading()
      },
      fail(er){
        console.log(er)
      }
    })
  },

  //获取更多的财经新闻
  gengduo() {
    let that = this;
    if (that.data.nomore || that.data.list.length < 20) {
      wx.showToast({
        title: '没有更多了',
      })
      return false
    }
    if(that.data.channel=='跑腿资讯'){
      let page = that.data.page + 1;
      //经过上一句执行，page的值已经为1了，所以下面的page*20=20
      db.collection('wenzhang').orderBy('_updateTime', 'desc').skip(page * 20).limit(20).get({
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
    }
    if(that.data.channel=='财经新闻'){
      let start = that.data.list.length;
      wx.request({
        url: 'https://api.jisuapi.com/news/get',
        data:{
          channel:'财经',
          start:start,
          num:20,
          appkey:'4178edcb5e1ae9cf'
        },
        success:function(res){
              console.log(res)
              if(res.data.result.list.length<20||res.data.result.list.length==0){
                that.setData({
                  nomore:true,
                })
                
              }
              //继续赋值给list数组
              that.setData({
                 list:that.data.list.concat(res.data.result.list)
              }) 
              //暂停刷新
              wx.stopPullDownRefresh();
              wx.hideLoading()
        },
        fail(er){
          console.log(er)
        }
      })
    }
  },
  //跳转到帮我买、帮我送、帮我取、代取快递、代取外卖、其他跑腿
  go:function(e){
    console.log(e.currentTarget.dataset.id)
    wx.navigateTo({
      url: e.currentTarget.dataset.id,
    })
  },
  //待开发
  daikaifa:function(){
    let that = this;
    wx.showToast({
      title: '待开发，请耐心等待',
      icon: 'none',
      duration: 2000
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
    //触底了就触发gengduo函数，去获取更多数据
    this.gengduo();
  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {

  }
})