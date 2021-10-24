// pages/fabu/fabu.js
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

         //中间值
         cost:0,
         anniu_show:-1,          //做按钮显示限制，防止用户多次点击单个按钮
		 kejin:true,
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
       
  },
  chakan_pingjia:function(event){
      let that = this;
      let publish_id = event.currentTarget.dataset.id
      wx.navigateTo({
      url: '/pages/chakan_pingjia/chakan_pingjia?publish_id='+publish_id,
      })
  },
  //评价跑腿员
  pingjia:function(event){
        let that = this;
        let publish_id = event.currentTarget.dataset.id
        wx.navigateTo({
          url: '/pages/pingjia/pingjia?publish_id='+publish_id,
        })
  },
  //删除订单
  delete_order:function(event){
        let that = this;
		 if(!that.data.kejin){
            return false;
        }
        
        that.setData({
            anniu_show:event.currentTarget.dataset.anniu_show,
			kejin:false,
      })
        wx.showLoading({
          title: '正在删除',
        })
        let id = event.currentTarget.dataset.id
        db.collection('publish').doc(id).remove({
              success:function(res){
                  wx.hideLoading()
                  wx.showToast({
                      title: '删除成功',
                      icon: 'success',
                      duration: 2000
                  })
                  that.shuju();
                  that.setData({
                        anniu_show:true,
						kejin:true,
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
				  kejin:true
                })
              }
        })
  },
  //确定送达
  //第一要把publish的state改为3已完成，第二要把钱加到接单者的账户,第三要把接单的赚钱记录写入history，
  confirm_songda:function(event){
        let that = this;
		 if(!that.data.kejin){
            return false;
        }
        that.setData({
            anniu_show:event.currentTarget.dataset.anniu_show,
			kejin:false,
      })

        let id = event.currentTarget.dataset.id
        let order_id = event.currentTarget.dataset.order_id
        //用data里面的cost来接受点击的那个记录的cost值，方便传给事务处理
        that.setData({
              cost:event.currentTarget.dataset.cost,
        })
        wx.showLoading({
          title: '正在确认',
        })
        //使用get_jiePhone云函数进行联表查询获得接单者的_openid（这个有两个作用，第一存入history钱记录的时候需要，第二要用来查询user表获取user_id）
        wx.cloud.callFunction({
              name:'get_jiePhone',
              data:{
                    id:id
              },
              success:function(res){
                    console.log('这是接单者的openid：'+res.result.list[0].List[0]._openid)
                  
                   that.confirmshiwu(res.result.list[0].List[0]._openid,id,order_id);
                    
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
  confirmshiwu:function(e,e_id,order_id){
      let that = this;
      db.collection('user').where({
            _openid:e
      }).get({
            success:function(re){
                  console.log('这是接单的user_id：'+re.data[0]._id)
                  //都拿到用户的openid和用户的user表_id,还有publish的_id，开始事务处理
                  wx.cloud.callFunction({
                        name:'confirm_songda',
                        data:{
                              user_id:re.data[0]._id,
                              jie_openid:e,
                              publish_id:e_id,  //publish的_id,
                              cost:that.data.cost,
                              stamp:new Date().getTime(),
                              name:'接单赚钱',
                              order_id:order_id,
                        },
                        success:function(r){
                             
                              if(r.result.success){
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
										  kejin:true,
                                        })
      
                                   
                              }
                              if(!r.result.success){
                                    wx.hideLoading()
                                    wx.showToast({
                                          title: '失败，请重试',
                                          icon: 'none',
                                          duration: 2000
                                    })
                                    that.setData({
                                          anniu_show:true,
										  kejin:true
                                        })
      
                              }
                        },
                        fail(err){
                              wx.hideLoading()
                              wx.showToast({
                                  title: '失败，请重试',
                                  icon: 'none',
                                  duration: 2000
                            })
                            that.setData({
                              anniu_show:true,
							  kejin:true
                            })

                        }
                  })
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
				  kejin:true
                })
            }
      })
  },
  //拨打电话，联系跑腿员
  call_phone:function(event){
        let that = this;
        that.setData({
            anniu_show:event.currentTarget.dataset.anniu_show,
      })
        wx.showLoading({
          title: '正在拨打',
        })
       wx.cloud.callFunction({
             name:'get_jiePhone',
             data:{
                   id:event.currentTarget.dataset.id,
             },
             success:function(res){
                   console.log(res)
                   wx.hideLoading()
                   wx.makePhoneCall({
                        phoneNumber: res.result.list[0].List[0].jiedan_phone,
                   })
                   that.setData({
                        anniu_show:true,
                      })
             },
             fail(er){
                   console.log(er)
                   that.setData({
                        anniu_show:true,
                      })
             }
       })
  },
  //在publish数据库表里添加cui布尔值字段，来限制只能发一次催一催，防止多次点击发送
  cui:function(event){
        let that = this;
		 if(!that.data.kejin){
            return false;
        }
        that.setData({
            anniu_show:event.currentTarget.dataset.anniu_show,
			kejin:false,
      })
        wx.showLoading({
            title: '正在催',
          })
         wx.cloud.callFunction({
               name:'get_jiePhone',
               data:{
                     id:event.currentTarget.dataset.id,
               },
               success:function(res){
                     console.log(res)
                    wx.cloud.callFunction({
                          name:'cui',
                          data:{
                                jie_phone:res.result.list[0].List[0].jiedan_phone,
                                _id:event.currentTarget.dataset.id
                          },
                          success:function(re){
                              console.log(re)
                              wx.hideLoading()
                              if(re.result.success){
                                    wx.showToast({
                                          title: '操作成功',
                                          icon: 'success',
                                          duration: 2000
                                    })
                                    //成功后，要重新获取新数据，
                                    that.shuju();
                                    that.setData({
                                          anniu_show:true,
										  kejin:true,
                                        })
                              }
                              if(!re.result.success){
                                    wx.showToast({
                                          title: '失败，请重试',
                                          icon: 'none',
                                          duration: 2000
                                    })
                                    that.setData({
                                          anniu_show:true,
										  kejin:true
                                        })
                              }
                              
                          },
                          fail(eee){
                              console.log(eee)
                              wx.hideLoading()
                              wx.showToast({
                                 title: '失败，请重试',
                                 icon: 'none',
                                 duration: 2000
                              })
                              that.setData({
                                    anniu_show:true,
									kejin:true
                                  })
                          }
                    })
               },
               fail(er){
                     console.log(er)
                     wx.hideLoading()
                     wx.showToast({
                        title: '失败，请重试',
                        icon: 'none',
                        duration: 2000
                     })
                     that.setData({
                        anniu_show:true,
						kejin:true
                      })
               }
         })
  },
  //取消订单
  //第一，改变publish的state为4，第二、把钱退回钱包里，第三、存入history数据库表
  //重要的一点，需要把publish数据库表权限改为所有人可读写
  //    {
  //       "read": true,
  //       "write": true
  //     }
  cancel_order:function(event){
        let that = this;
		 if(!that.data.kejin){
            return false;
        }
        console.log(event)
        that.setData({
              anniu_show:event.currentTarget.dataset.anniu_show,
			  kejin:false,
        })
        wx.showLoading({
          title: '正在取消',
        })
        
        db.collection('user').where({
              _openid:event.currentTarget.dataset._openid,
        }).get({
              success:function(rr){
                  wx.cloud.callFunction({
                        name:'cancel_order',
                        data:{
                              _id:event.currentTarget.dataset.id,
                              name:'取消订单',
                              stamp:new Date().getTime(),
                              cost:event.currentTarget.dataset.yuanjia,
                              user_id:rr.data[0]._id,
          
                        },
                        success:function(res){
                              console.log(res)
                            if(res.result.success){
          
                                  //重新获取数据进行list更新
                                  that.shuju();
                                  wx.hideLoading()
                                  wx.showToast({
                                        title: '取消成功',
                                        icon: 'success',
                                        duration: 2000
                                  })
                                  that.setData({
                                    anniu_show:true,
									kejin:true,
                                  })
                            }
                            if(!res.result.success){
                                  wx.hideLoading();
                                  wx.showToast({
                                        title: '取消失败，请重试',
                                        icon: 'none',
                                        duration: 2000
                                  })
                                  that.setData({
                                    anniu_show:true,
									kejin:true
                                  })
                            }
                        },
                        fail(er){
                            console.log(er)
                            wx.hideLoading();
                            wx.showToast({
                                  title: '取消失败，请重试',
                                  icon: 'none',
                                  duration: 2000
                            })
                            that.setData({
                              anniu_show:true,
							  kejin:true
                            })
                        }
                  })
              },
              fail(ee){
                  wx.hideLoading();
                  wx.showToast({
                        title: '取消失败，请重试',
                        icon: 'none',
                        duration: 2000
                  })
                  that.setData({
                        anniu_show:true,
						kejin:true
                  })
              }
        })
       
  },
  //监听切换导航的变化
  onChange(event) {
    console.log(event.detail.title)
    let that = this;
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
         if(that.data.tab=='待接单'){
           //获取待接单的单子列表
            that.get_dai();
         }
         if(that.data.tab=='配送中'){
           //获取配送中的单子列表
            that.get_song();
         }
         if(that.data.tab=='待确认'){
          //获取已完成的单子列表
           that.get_que();
         }
      
         if(that.data.tab=='已完成'){
          //获取已完成的单子列表
           that.get_wan();
         }
         if(that.data.tab=='已取消'){
           //获取已取消的单子列表
            that.get_qu();
         }
  },

  //获取单子列表
  //publish表里的字段state等于1代表待接单，2代表配送中，3代表已完成，4代表已取消，5代表待确认
  get:function(){
    let that = this;
    db.collection('publish').where({
         _openid:app.globalData.openid,
    }).orderBy('creat', 'desc').limit(20).get({
      success:function(res){
           console.log(res)
           that.setData({
             list:res.data,
           })
           wx.stopPullDownRefresh(); //暂停刷新动作
      },
      fail(){
         //提示用户获取失败
         wx.showToast({
           title: '获取失败，请重新获取',
           icon: 'none',
           duration: 2000
         })
         wx.stopPullDownRefresh(); //暂停刷新动作
      }
    })
  },
  //获取待接单的单子列表
  get_dai:function(){
    let that = this;
    db.collection('publish').where({
      state:1,
      _openid:app.globalData.openid,
    }).orderBy('creat', 'desc').limit(20).get({
      success:function(res){
           console.log(res)
           that.setData({
             list:res.data,
           })
           wx.stopPullDownRefresh(); //暂停刷新动作
      },
      fail(){
         //提示用户获取失败
         wx.showToast({
           title: '获取失败，请重新获取',
           icon: 'none',
           duration: 2000
         })
         wx.stopPullDownRefresh(); //暂停刷新动作
      }
    })
  },
  //获取配送中的单子列表
  get_song:function(){
    let that = this;
    db.collection('publish').where({
      state:2,
      _openid:app.globalData.openid,
    }).orderBy('creat', 'desc').limit(20).get({
      success:function(res){
           console.log(res)
           that.setData({
             list:res.data,
           })
           wx.stopPullDownRefresh(); //暂停刷新动作
      },
      fail(){
         //提示用户获取失败
         wx.showToast({
           title: '获取失败，请重新获取',
           icon: 'none',
           duration: 2000
         })
         wx.stopPullDownRefresh(); //暂停刷新动作
      }
    })
  },
  //获取待确认的单子列表
  get_que:function(){
    let that = this;
    db.collection('publish').where({
      state:5,
      _openid:app.globalData.openid,
    }).orderBy('creat', 'desc').limit(20).get({
      success:function(res){
           console.log(res)
           that.setData({
             list:res.data,
           })
           wx.stopPullDownRefresh(); //暂停刷新动作
      },
      fail(){
         //提示用户获取失败
         wx.showToast({
           title: '获取失败，请重新获取',
           icon: 'none',
           duration: 2000
         })
         wx.stopPullDownRefresh(); //暂停刷新动作
      }
    })
  },
   //获取已完成的单子列表
   get_wan:function(){
    let that = this;
    db.collection('publish').where({
      state:3,
      _openid:app.globalData.openid,
    }).orderBy('creat', 'desc').limit(20).get({
      success:function(res){
           console.log(res)
           that.setData({
             list:res.data,
           })
           wx.stopPullDownRefresh(); //暂停刷新动作
      },
      fail(){
         //提示用户获取失败
         wx.showToast({
           title: '获取失败，请重新获取',
           icon: 'none',
           duration: 2000
         })
         wx.stopPullDownRefresh(); //暂停刷新动作
      }
    })
  },
   //获取已取消的单子列表
   get_qu:function(){
    let that = this;
    db.collection('publish').where({
      state:4,
      _openid:app.globalData.openid,
    }).orderBy('creat', 'desc').limit(20).get({
      success:function(res){
           console.log(res)
           that.setData({
             list:res.data,
           })
           wx.stopPullDownRefresh(); //暂停刷新动作
      },
      fail(){
         //提示用户获取失败
         wx.showToast({
           title: '获取失败，请重新获取',
           icon: 'none',
           duration: 2000
         })
         wx.stopPullDownRefresh(); //暂停刷新动作
      }
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
      //经过上一句执行，page的值已经为1了，所以下面的page*20=20
      db.collection('publish').where({
            _openid:app.globalData.openid,
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
    }
    if(that.data.tab=='待接单'){
      let page = that.data.page + 1;
      //经过上一句执行，page的值已经为1了，所以下面的page*20=20，下标20就是第21条记录
      db.collection('publish').where({
         state:1,
         _openid:app.globalData.openid,
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
                        //这里的page为1，
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
    if(that.data.tab=='配送中'){
      let page = that.data.page + 1;
      //经过上一句执行，page的值已经为1了，所以下面的page*20=20
      db.collection('publish').where({
        state:2,
        _openid:app.globalData.openid,
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
                        //这里的page为1，
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
    if(that.data.tab=='待确认'){
      let page = that.data.page + 1;
      //经过上一句执行，page的值已经为1了，所以下面的page*20=20
      db.collection('publish').where({
        state:5,
        _openid:app.globalData.openid,
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
                        //这里的page为1，
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
    if(that.data.tab=='已完成'){
      let page = that.data.page + 1;
      //经过上一句执行，page的值已经为1了，所以下面的page*20=20
      db.collection('publish').where({
        state:3,
        _openid:app.globalData.openid,
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
                        //这里的page为1，
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
    if(that.data.tab=='已取消'){
      let page = that.data.page + 1;
      //经过上一句执行，page的值已经为1了，所以下面的page*20=20
      db.collection('publish').where({
        state:4,
        _openid:app.globalData.openid,
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
                        //这里的page为1，
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
       if(that.data.tab=='待接单'){
         //获取待接单的单子列表
          that.get_dai();
       }
       if(that.data.tab=='配送中'){
         //获取配送中的单子列表
          that.get_song();
       }
       if(that.data.tab=='待确认'){
        //获取待确认的单子列表
         that.get_que();
      }
       if(that.data.tab=='已完成'){
        //获取已完成的单子列表
         that.get_wan();
       }
       if(that.data.tab=='已取消'){
         //获取已取消的单子列表
          that.get_qu();
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