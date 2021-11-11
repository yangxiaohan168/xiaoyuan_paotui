// pages/secondhand/secondhand.js
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
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
      let that = this;
     
      wx.showLoading({
        title: '加载中',
      })
      
      wx.getStorage({
        key: 'campus',
        success (res) {
          console.log(res.data)
          //把缓存的openid赋给全局变量openid
          app.globalData.campus = res.data;
          //去获取该校区的闲置物品帖子
          // that.get_xianzhi();
        },
        fail(er){
          console.log('第一次进来')
          //第一次进来没有这个campus缓存，可以获取存进去
          //获取用户的campus
          that.get_usercampus();
        }
      })
      
  },
  //打电话联系
  make_phone:function(event){
    let that = this;
    let phone = event.currentTarget.dataset.phone
    wx.makePhoneCall({
      phoneNumber: phone,
    })
  },
  yulan_img:function(e){
    let that = this;
    let img = e.currentTarget.dataset.img
    wx.previewImage({
      urls: [img],
    })
  },
  //搜索帖子
  onSearch:function(event){
    let that = this;
    console.log(event.detail)
    wx.showLoading({
      title: '正在搜索',
    })
    db.collection('second').where({
        search_name:db.RegExp({
          regexp: '.*' + event.detail + '.*',
          options: 'i',
       })
    }).orderBy('creat','desc').get({
      success:function(res){
            that.setData({
               list:res.data
            })
            wx.hideLoading()
      },
      fail(er){
           wx.hideLoading()
           wx.showToast({
            title: '搜索失败，请重试',
            icon: 'none',
            duration: 2000
          })
      }
    })
   
  },
  //获取帖子数据
  get_xianzhi:function(){
    let that = this;
    db.collection('second').where({
        choose_campus:app.globalData.campus,
    }).orderBy('creat','desc').limit(20).get({
      success:function(res){
          that.setData({
            list:res.data,
          })
          wx.hideLoading()
          console.log(res)
      },
      fail(er){
        wx.hideLoading()
        console.log(er)
      }
    })
  },
  //获取用户所属校区
  get_usercampus:function(){
    let that = this;
    db.collection('user').where({
      _openid:app.globalData.openid,
    }).get({
      success:function(res){
          
           if(res.data.length==0||!res.data[0].campus_name){
            wx.hideLoading()
              wx.showModal({
                title: '提示',
                content: '您还没有选择校区，请前往选择',
                showCancel:false,
                confirmText:'前往选择',
                success (res) {
                  if (res.confirm) {
                    console.log('用户点击确定')
                    wx.navigateTo({
                      url: '/pages/edit/edit',
                    })
                  } else if (res.cancel) {
                    console.log('用户点击取消')
                  }
                }
              })
              
           }
           if(res.data.length!==0){
              
              app.globalData.campus = res.data[0].campus_name;
              //把campus放到缓存里面
              wx.setStorage({
                key:"campus",
                data:res.data[0].campus_name
              }) 
              //开始获取数据
              that.get_xianzhi();
           }
      },
      fail(er){
          wx.hideLoading()
          wx.showToast({
            title: '获取失败，请重试',
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
  //跳转发布
  go_fabu:function(){
    let that = this;
    wx.navigateTo({
      url: '/pages/second_fabu/second_fabu',
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
     
      if(app.globalData.campus==''){
          that.get_usercampus();
      }
      if(app.globalData.campus!==''){
        that.get_xianzhi();
      }
      
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
  //获取更多数据
  get_more:function(){
    let that = this;
    if (that.data.nomore || that.data.list.length < 20) {
      wx.showToast({
        title: '没有更多了',
      })
      return false
    }
    let page = that.data.page + 1;
     
      //经过上一句执行，page的值已经为1了，所以下面的page*20=20，下标20就是第21条记录
      db.collection('second').where({
         choose_campus:app.globalData.campus,
      }).orderBy('creat', 'desc').skip(page * 20).limit(20).get({
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
  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {
       let that = this;
       that.get_more();
  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {

  }
})
