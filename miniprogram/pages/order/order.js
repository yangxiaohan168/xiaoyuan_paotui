// pages/publish/publish.js
const app = getApp();
const db = wx.cloud.database();
Page({

  /**
   * 页面的初始数据
   */
  data: {
         tab:'全部',
         list:[],
         nomore:false,
         page:0,

         anniu_show:-1,     //做按钮显示限制，防止用户多次点击单个按钮
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
       
  },
  //联系客户
  call_phone:function(event){
        let that = this;
        that.setData({
            anniu_show:event.currentTarget.dataset.anniu_show,
      })

        console.log(event)
        let phone = event.currentTarget.dataset.phone
        wx.makePhoneCall({
          phoneNumber: phone,
        })
        that.setData({
            anniu_show:true,
          })
  },
   //删除订单
   delete_order:function(event){
      let that = this;
      that.setData({
            anniu_show:event.currentTarget.dataset.anniu_show,
      })
      wx.showLoading({
        title: '正在删除',
      })
      let id = event.currentTarget.dataset.id
      db.collection('order').doc(id).remove({
            success:function(res){
               
                that.shuju();
                wx.hideLoading()
                wx.showToast({
                    title: '删除成功',
                    icon: 'success',
                    duration: 2000
                })
                that.setData({
                  anniu_show:true,
                })

            },
            fail(er){
                wx.hideLoading()
                wx.showToast({
                    title: '删除失败，请重试',
                    icon: 'none',
                    duration: 2000
              })
              that.setData({
                  anniu_show:true,
                })

            }
      })
},
  //催客户确认送达
  cui_kehu:function(event){
        let that = this;
        that.setData({
            anniu_show:event.currentTarget.dataset.anniu_show,
      })
        console.log(event)
        let ke_phone = event.currentTarget.dataset.phone
        let order_id = event.currentTarget.dataset.order_id
        wx.cloud.callFunction({
              name:'cui_kehu',
              data:{
                    order_id:order_id,
                    ke_phone:ke_phone,
              },
              success:function(res){
                  if(res.result.success){
                        
                        //成功后，要重新获取新数据，
                        that.shuju();
                        wx.hideLoading()
                        wx.showToast({
                              title: '操作成功',
                              icon: 'success',
                              duration: 2000
                        })
                        that.setData({
                              anniu_show:true,
                            })
 
                  }
                  if(!res.result.success){
                        wx.hideLoading()
                        wx.showToast({
                              title: '失败，请重试',
                              icon: 'none',
                              duration: 2000
                        })
                        that.setData({
                              anniu_show:true,
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
                  that.setData({
                        anniu_show:true,
                      })
              }
        })
  },
  //监听切换导航的变化
  onChange(event) {
    console.log(event.detail.title)
    let that = this;
    //每次切换，都要把page归零，不然到第二个导航标获取更多数据的时候，会跳过很多东西
    that.setData({
        tab:event.detail.title,
        page:0,
    })
    that.shuju();

  },
  shuju:function(){
        let that = this;
        if(that.data.tab=='全部'){
            that.get();
         }
         if(that.data.tab=='接单中'){
           //获取接单中的单子列表
            that.get_jie();
         }
         if(that.data.tab=='待确认'){
            //获取接单中的单子列表
             that.get_dai();
          }
         if(that.data.tab=='已完成'){
           //获取已完成的单子列表
            that.get_wan();
         }
         if(that.data.tab=='已转单'){
           //获取已转单的单子列表
            that.get_zhuan();
         }
         
  },
  //跑腿员确认送达，要做的事
  //第一要改变publish的state为5，第二要在order添加一个songda_time并计算跑腿用时
  //相当于更新publish和order
  confirm_songda:function(event){
        let that = this;
        that.setData({
            anniu_show:event.currentTarget.dataset.anniu_show,
        })
        console.log(event)
        wx.showLoading({
          title: '正在确认',
        })
        let publish_id = event.currentTarget.dataset.publish_id
        let order_id = event.currentTarget.dataset.order_id
        let creat = event.currentTarget.dataset.creat
        let now_time = new Date().getTime()
        let zong_haomiao = now_time - creat
        let zong_time = (zong_haomiao/60000).toFixed(0)    //多少分钟

        wx.cloud.callFunction({
              name:'jie_songda',
              data:{
                    publish_id:publish_id,
                    order_id:order_id,
                    zong_time:parseFloat(zong_time),
                    songda_time:now_time,
              },
              success:function(res){
                  
                  if(res.result.success){
                        
                        //成功后，要重新获取新数据，
                        that.shuju();
                        wx.hideLoading()
                        wx.showToast({
                              title: '确认成功',
                              icon: 'success',
                              duration: 2000
                        })
                        that.setData({
                              anniu_show:true,
                            })

                  }
                  if(!res.result.success){
                        wx.hideLoading()
                        wx.showToast({
                              title: '失败，请重试',
                              icon: 'none',
                              duration: 2000
                        })
                        that.setData({
                              anniu_show:true,
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
                that.setData({
                  anniu_show:true,
                })
              }
        })

  },
  //转单需要做的两件事
  //第一件事是改变publish的订单状态，第二件是改变order的订单状态
  zhuandan:function(event){
        let that = this;
        that.setData({
            anniu_show:event.currentTarget.dataset.anniu_show,
        })
        wx.showLoading({
          title: '正在转单',
        })
        let publish_id = event.currentTarget.dataset.publish_id
        let order_id = event.currentTarget.dataset.order_id
        wx.cloud.callFunction({
              name:'zhuandan',
              data:{
                    publish_id:publish_id,
                    order_id:order_id,
              },
              success:function(res){
                  
                  if(res.result.success){
                        
                        //成功后，要重新获取新数据，
                        that.shuju();
                        wx.hideLoading()
                        wx.showToast({
                              title: '转单成功',
                              icon: 'success',
                              duration: 2000
                        })
                        that.setData({
                              anniu_show:true,
                            })

                  }
                  if(!res.result.success){
                        wx.hideLoading()
                        wx.showToast({
                              title: '失败，请重试',
                              icon: 'none',
                              duration: 2000
                        })
                        that.setData({
                              anniu_show:true,
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
                that.setData({
                  anniu_show:true,
                })
              }
        })
  },
  //获取跑腿单子列表，order表里的字段category等于1代表接单中，2代表已完成，3代表已转单,4代表待确认
  get:function(){
    let that = this;
    wx.showLoading({
      title: '加载中',
    })
    let obj = {
      _openid:app.globalData.openid,
    }
    wx.cloud.callFunction({
          name:'order_lookup',
          data:{
               obj:obj,
               skip:0,
          },
          success:function(res){
                console.log(res)
                wx.hideLoading()
                that.setData({
                      list:res.result.list,
                })
                wx.stopPullDownRefresh(); //暂停刷新动作
          },
          fail(er){
                console.log(er)
                wx.stopPullDownRefresh(); //暂停刷新动作
          }
    })

  },
  //获取接单中的单子列表
  get_jie:function(){
    let that = this;
    wx.showLoading({
      title: '加载中',
    })
    let obj = {
      _openid:app.globalData.openid,
      category:1,
    }
    wx.cloud.callFunction({
          name:'order_lookup',
          data:{
               obj:obj,
               skip:0,
          },
          success:function(res){
                console.log(res)
                wx.hideLoading()
                that.setData({
                      list:res.result.list,
                })
                wx.stopPullDownRefresh(); //暂停刷新动作
          },
          fail(er){
                console.log(er)
                wx.stopPullDownRefresh(); //暂停刷新动作
          }
    })
  },
  //获取待确认的单子列表
  get_dai:function(){
      let that = this;
      wx.showLoading({
            title: '加载中',
          })
          let obj = {
            _openid:app.globalData.openid,
            category:4,
          }
          wx.cloud.callFunction({
                name:'order_lookup',
                data:{
                     obj:obj,
                     skip:0,
                },
                success:function(res){
                      console.log(res)
                      wx.hideLoading()
                      that.setData({
                            list:res.result.list,
                      })
                      wx.stopPullDownRefresh(); //暂停刷新动作
                },
                fail(er){
                      console.log(er)
                      wx.stopPullDownRefresh(); //暂停刷新动作
                }
          })
  },
  //获取已完成的单子列表
  get_wan:function(){
    let that = this;
    wx.showLoading({
      title: '加载中',
    })
    let obj = {
      _openid:app.globalData.openid,
      category:2,
    }
    wx.cloud.callFunction({
          name:'order_lookup',
          data:{
               obj:obj,
               skip:0,
          },
          success:function(res){
                console.log(res)
                wx.hideLoading()
                that.setData({
                      list:res.result.list,
                })
                wx.stopPullDownRefresh(); //暂停刷新动作
          },
          fail(er){
                console.log(er)
                wx.stopPullDownRefresh(); //暂停刷新动作
          }
    })
  },
   //获取已转单的单子列表
   get_zhuan:function(){
    let that = this;
    wx.showLoading({
      title: '加载中',
    })
    let obj = {
      _openid:app.globalData.openid,
      category:3,
    }
    wx.cloud.callFunction({
          name:'order_lookup',
          data:{
               obj:obj,
               skip:0,
          },
          success:function(res){
                console.log(res)
                wx.hideLoading()
                that.setData({
                      list:res.result.list,
                })
                wx.stopPullDownRefresh(); //暂停刷新动作
          },
          fail(er){
                console.log(er)
                wx.stopPullDownRefresh(); //暂停刷新动作
          }
    })
  },
//查看详情
chakan:function(e){
      let that = this;
      console.log(e.currentTarget.dataset.id)
      wx.navigateTo({
        url: '/pages/pub_detail/pub_detail?id='+e.currentTarget.dataset.id,
      })
},
  //获取更多数据
  gengduo:function() {
    let that = this;
    if (that.data.nomore || that.data.list.length < 20) {
      wx.showToast({
        title: '没有更多了',
      })
      return false
    }
    if(that.data.tab=='全部'){
          let page = that.data.page + 1;
          let obj = {
            _openid:app.globalData.openid,
          }
          let skip = page*20;
          wx.cloud.callFunction({
                name:'order_lookup',
                data:{
                     obj:obj,
                     skip:skip,
                },
                success:function(res){
                      console.log(res)
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
                              //这里的page为1，
                              page: page,
                              list: that.data.list.concat(res.data)
                        })
                },
                fail(er){
                      console.log(er)
                      wx.showToast({
                        title: '获取失败',
                        icon: 'none'
                      })
                }
          })
      
    }
    if(that.data.tab=='接单中'){
          let page = that.data.page + 1;
          let obj = {
            _openid:app.globalData.openid,
            category:1,
          }
          let skip = page*20;
          wx.cloud.callFunction({
                name:'order_lookup',
                data:{
                     obj:obj,
                     skip:skip,
                },
                success:function(res){
                      console.log(res)
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
                              //这里的page为1，
                              page: page,
                              list: that.data.list.concat(res.data)
                        })
                },
                fail(er){
                      console.log(er)
                      wx.showToast({
                        title: '获取失败',
                        icon: 'none'
                      })
                }
          })
    }
    if(that.data.tab=='待确认'){
      let page = that.data.page + 1;
      let obj = {
        _openid:app.globalData.openid,
        category:4,
      }
      let skip = page*20;
      wx.cloud.callFunction({
            name:'order_lookup',
            data:{
                 obj:obj,
                 skip:skip,
            },
            success:function(res){
                  console.log(res)
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
                          //这里的page为1，
                          page: page,
                          list: that.data.list.concat(res.data)
                    })
            },
            fail(er){
                  console.log(er)
                  wx.showToast({
                    title: '获取失败',
                    icon: 'none'
                  })
            }
      })
    }
    if(that.data.tab=='已完成'){
          let page = that.data.page + 1;
          let obj = {
            _openid:app.globalData.openid,
            category:2,
          }
          let skip = page*20;
          wx.cloud.callFunction({
                name:'order_lookup',
                data:{
                     obj:obj,
                     skip:skip,
                },
                success:function(res){
                      console.log(res)
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
                              //这里的page为1，
                              page: page,
                              list: that.data.list.concat(res.data)
                        })
                },
                fail(er){
                      console.log(er)
                      wx.showToast({
                        title: '获取失败',
                        icon: 'none'
                      })
                }
          })
    }
    if(that.data.tab=='已转单'){
      let page = that.data.page + 1;
          let obj = {
            _openid:app.globalData.openid,
            category:3,
          }
          let skip = page*20;
          wx.cloud.callFunction({
                name:'order_lookup',
                data:{
                     obj:obj,
                     skip:skip,
                },
                success:function(res){
                      console.log(res)
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
                              //这里的page为1，
                              page: page,
                              list: that.data.list.concat(res.data)
                        })
                },
                fail(er){
                      console.log(er)
                      wx.showToast({
                        title: '获取失败',
                        icon: 'none'
                      })
                }
          })
    }
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
         that.setData({
            anniu_show:-1,
      })
         //实时刷新单子列表
         if(that.data.tab=='全部'){
            that.get();
         }
         if(that.data.tab=='接单中'){
           //获取接单中的单子列表
            that.get_jie();
         }
         if(that.data.tab=='待确认'){
            //获取待确认的单子列表
             that.get_dai();
          }
         if(that.data.tab=='已完成'){
           //获取已完成的单子列表
            that.get_wan();
         }
         if(that.data.tab=='已转单'){
           //获取已转单的单子列表
            that.get_zhuan();
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
      let that = this;
      that.setData({
            anniu_show:-1,
      })
      that.shuju();
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