// pages/publish/publish.js
const app = getApp();
const db = wx.cloud.database();
const _ = db.command;
Page({

  /**
   * 页面的初始数据
   */
  data: {
         tab:'全部',
         list:[],
         nomore:false,
         page:0,

         jiedan_name:'',
         jiedan_phone:'',
         userInfo:'',
         avatarUrl:'',
         nickName:'',
         anniu_show:-1, //做按钮显示限制，防止用户多次点击单个按钮
         
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
   
  },
  //查看详情
  chakan:function(e){
        let that = this;
        console.log(e.currentTarget.dataset.id)
        wx.navigateTo({
          url: '/pages/pub_detail/pub_detail?id='+e.currentTarget.dataset.id,
        })
  },
  //查询有无权限
  get_quanxian:function(){
        let that = this;

        db.collection('runner').where({
              _openid:app.globalData.openid,
              pass:true,
        }).get({
              success:function(res){
                  //无权限
                  if(res.data.length==0){
                        //实时刷新单子列表
                        if(that.data.tab=='全部'){
                              let cha_obj = {
                                    state:_.in([1, 3]),
                              }
                              that.get(cha_obj);
                        }
                        if(that.data.tab=='帮我买'){
                             //获取帮我买的单子列表
                             let cha_obj = {
                              state:1,
                              category:'帮我买'
                             }
                             that.get_mai(cha_obj);
                        }
                        if(that.data.tab=='帮我送'){
                             //获取帮我送的单子列表
                             let cha_obj = {
                              state:1,
                              category:'帮我送'
                             }
                              that.get_song(cha_obj);
                        }
                        if(that.data.tab=='帮我取'){
                             //获取帮我取的单子列表
                             let cha_obj = {
                              state:1,
                              category:'帮我取'
                             }
                              that.get_qu(cha_obj);
                        }
                  }
                  //有权限
                  if(res.data.length!==0){
                        app.globalData.campus = res.data[0].campus;
                       //把campus放到缓存里面
                        wx.setStorage({
                              key:"campus",
                              data:res.data[0].campus,
                        })

                        //实时刷新单子列表
                        if(that.data.tab=='全部'){
                              let cha_obj = {
                                    state:_.in([1, 3]),
                                    choose_campus:app.globalData.campus,
                              }
                              that.get(cha_obj);
                        }
                        if(that.data.tab=='帮我买'){
                             //获取帮我买的单子列表
                             let cha_obj = {
                                    state:1,
                                    choose_campus:app.globalData.campus,
                                    category:'帮我买',
                              }
                              that.get_mai(cha_obj);
                        }
                        if(that.data.tab=='帮我送'){
                             //获取帮我送的单子列表
                             let cha_obj = {
                                    state:1,
                                    choose_campus:app.globalData.campus,
                                    category:'帮我送',
                              }
                              that.get_song(cha_obj);
                        }
                        if(that.data.tab=='帮我取'){
                             //获取帮我取的单子列表
                             let cha_obj = {
                                    state:1,
                                    choose_campus:app.globalData.campus,
                                    category:'帮我取',
                             }
                              that.get_qu(cha_obj);
                        }
                  }
              },
              fail(er){
                  wx.showToast({
                        title: '获取失败',
                        icon: 'none',
                        duration: 2000
                  })
                  //查询失败，跳转首页
                  setTimeout(function(){
                        wx.reLaunch({
                          url: '/pages/index/index',
                        })
                  },1000)
                      
              }
        })
  },
  
  //用户点击立即接单
  jiedan:function(event){
        let that = this;
        that.setData({
            anniu_show:event.currentTarget.dataset.anniu_show,
       })
        console.log(event)
        wx.showLoading({
          title: '正在接单',
        })
        let id = event.currentTarget.dataset.id
        //先判断用户有没有权限接单
        db.collection('runner').where({
              _openid:app.globalData.openid,
              pass:true,
        }).get({
              success:function(res){
                    //无权限，则提示
                    if(res.data.length==0){
                        wx.hideLoading();
                        wx.showModal({
                              title: '提示',
                              content: '您还没有接单权限，请先认证',
                              success (res) {
                                if (res.confirm) {
                                  console.log('用户点击确定')
                                  wx.navigateTo({
                                    url: '/pages/apply/apply',
                                  })
                                } else if (res.cancel) {
                                  console.log('用户点击取消')
                                  that.setData({
                                    anniu_show:true,
                                  })
                                }
                              }
                        })
                    }
                    //有权限，则先把接单人的姓名和号码信息保存到data里面，
                    //再把id传过去，开始查询是否已经被人接单过
                    if(res.data.length!==0){
                         that.setData({
                               jiedan_name:res.data[0].name,
                               jiedan_phone:res.data[0].phone,
                               userInfo:res.data[0].userInfo,
                               avatarUrl:res.data[0].avatarUrl,
                               nickName:res.data[0].nickName,
                         })
                         //开始查询订单是否已经被接单
                         that.get_jiedan(id);
                    }
              },
              fail(eeee){
                  wx.hideLoading()
                  wx.showToast({
                    title: '接单失败，请重试',
                    icon: 'none',
                    duration: 2000
                  })
                  that.setData({
                        anniu_show:true,
                      })
              }
        })
       
  },
  get_jiedan:function(id){
        let that = this;
        db.collection('publish').where({
            _id:id,
            state:1,
        }).get({
            success:function(res){
                if(res.data.length==0){
                  wx.hideLoading()
                  wx.showToast({
                        title: '已被接单，请另选其他单',
                        icon: 'none',
                        duration: 2000
                  })
                  //说明存在旧数据，刷新一次，虽然已经加了实时监听，但为了防止极端情况出现，还是要加这个判断
                  if(that.data.tab=='全部'){
                        that.get();
                  }
                  if(that.data.tab=='帮我买'){
                  //获取帮我买的单子列表
                  that.get_mai();
                  }
                  if(that.data.tab=='帮我送'){
                  //获取帮我送的单子列表
                  that.get_song();
                  }
                  if(that.data.tab=='帮我取'){
                  //获取帮我取的单子列表
                  that.get_qu();
                  }
                  that.setData({
                        anniu_show:true,
                      })
                     
                }
                //如果存在，则开始发起一个事务，事务处理有：1、改变publish的state状态，2、存入order数据库关系表
                //要把接单人的信息和cost一起存到order表里，以便用户查询联系接单人以及接单排行榜的处理，同时要加个category字段来判断order订单的状态
                //还要把这个publish的_id传给云函数
                if(res.data.length!==0){
                     //调用云函数处理事务
                     wx.cloud.callFunction({
                           name:'jiedan',
                           data:{
                                 jiedan_name:that.data.jiedan_name,
                                 jiedan_phone:that.data.jiedan_phone,
                                 jiedan_avatarUrl:that.data.avatarUrl,
                                 jiedan_userInfo:that.data.userInfo,
                                 jiedan_nickName:that.data.nickName,
                                 cost:res.data[0].cost,
                                 _id:id,
                                 creat:new Date().getTime(),
                           },
                           success:function(re){
                              console.log(re)
                              //成功，则一秒后跳转到order订单页面
                              if(re.result.success){
                                    //接单成功就开始发送短信
                                    wx.cloud.callFunction({
                                          name:'sms',
                                          data:{
                                                jie_phone:that.data.jiedan_phone,
                                                ke_phone:res.data[0].phone,
                                          },
                                          success:function(rr){
                                              //发送短信成功
                                              console.log(rr)
                                              console.log('短信发送成功')
                                          },
                                          fail(err){
                                                console.log('短信发送失败')
                                                console.log(err)
                                          }
                                    })
                                    wx.hideLoading()
                                    wx.showToast({
                                          title: '接单成功',
                                          icon: 'success',
                                          duration: 2000
                                    })
                                   
                                    setTimeout(function(){
                                         wx.switchTab({
                                           url: '/pages/order/order',
                                         })
                                    },1000)
                                    that.setData({
                                          anniu_show:true,
                                    })
                              }
                              //如果失败，则提示重试
                              if(!re.result.success){
                                wx.hideLoading()
                                wx.showToast({
                                  title: '接单失败，请重试',
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
                                    title: '接单失败，请重试',
                                    icon: 'none',
                                    duration: 2000
                              })
                              that.setData({
                                    anniu_show:true,
                              })
                           }
                     })

                }
            },
            fail(er){
                  wx.hideLoading()
                  wx.showToast({
                    title: '接单失败，请重试',
                    icon: 'none',
                    duration: 2000
                  })
                  that.setData({
                        anniu_show:true,
                      })
            }
      })
  },

  //监听切换导航的变化（跑腿、财经）
  onChange(event) {
    console.log(event.detail.title)
    let that = this;
    //每次切换，都要把page归零，不然到第二个导航标获取更多数据的时候，会跳过很多东西
    that.setData({
        tab:event.detail.title,
        page:0,
    })
    //无权限
    if(app.globalData.campus==''){
            //实时刷新单子列表
            if(that.data.tab=='全部'){
            let cha_obj = {
                  state:_.in([1, 3]),
            }
            that.get(cha_obj);
            }
            if(that.data.tab=='帮我买'){
            //获取帮我买的单子列表
            let cha_obj = {
                  state:1,
                  category:'帮我买'
            }
            that.get_mai(cha_obj);
            }
            if(that.data.tab=='帮我送'){
            //获取帮我送的单子列表
            let cha_obj = {
                  state:1,
                  category:'帮我送'
            }
                  that.get_song(cha_obj);
            }
            if(that.data.tab=='帮我取'){
            //获取帮我取的单子列表
            let cha_obj = {
                  state:1,
                  category:'帮我取'
            }
                  that.get_qu(cha_obj);
            }
    }
    //有权限
    if(app.globalData.campus!==''){
             //实时刷新单子列表
             if(that.data.tab=='全部'){
                  let cha_obj = {
                        state:_.in([1, 3]),
                        choose_campus:app.globalData.campus,
                  }
                  that.get(cha_obj);
            }
            if(that.data.tab=='帮我买'){
                 //获取帮我买的单子列表
                 let cha_obj = {
                        state:1,
                        choose_campus:app.globalData.campus,
                        category:'帮我买',
                  }
                  that.get_mai(cha_obj);
            }
            if(that.data.tab=='帮我送'){
                 //获取帮我送的单子列表
                 let cha_obj = {
                        state:1,
                        choose_campus:app.globalData.campus,
                        category:'帮我送',
                  }
                  that.get_song(cha_obj);
            }
            if(that.data.tab=='帮我取'){
                 //获取帮我取的单子列表
                 let cha_obj = {
                        state:1,
                        choose_campus:app.globalData.campus,
                        category:'帮我取',
                 }
                  that.get_qu(cha_obj);
            }
         
    }
   
  },

  //获取全部跑腿单子列表
  get:function(obj){
    let that = this;
   
    console.log(obj)
      db.collection('publish').where(obj).orderBy('creat', 'desc').limit(20).get({
        success:function(res){
             console.log(res)
             if(res.data.length<20){
                   that.setData({
                         nomore:true,
                   })
                   console.log('没有更多了')
             }
             that.setData({
               list:res.data,
             })
             //开始监听刚刚这20条记录的变化
             //以防其他跑腿员已点击接单，而我这边数据还没有更新，就会导致出错
              let watcher = db.collection('publish').where(obj)
              // 按 creat 降序
              .orderBy('creat', 'desc')
              // 取按 orderBy 排序之后的前 20 个
              .limit(that.data.list.length)
              .watch({
                    onChange: function(snapshot) {
                          console.log('文档的更改事件：', snapshot.docChanges)
                          console.log('事件后的查询结果快照：', snapshot.docs)
                          console.log('初始化type的值为init：', snapshot.type)
                          //判断导航，以防导航和列表不对应，不对应或者大于20条记录，则让更多函数的监听机制来监听，同时关闭这里的监听。
                          if(that.data.tab!=="全部"||that.data.list.length>20){
                                //如果不是对于的导航标，则关闭该导航标的监听，不要污染list数据
                                watcher.close();
                          }
                          if(that.data.tab=="全部"){
                                //snapshot.docs是新的查询结果
                                that.setData({
                                      list:snapshot.docs
                                })
                          }
                    },
                    onError: function(err) {
                          console.error('the watch closed because of error', err)
                    }
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
  //获取帮我买的单子列表
  get_mai:function(obj){
    let that = this;
    db.collection('publish').where(obj).orderBy('creat', 'desc').limit(20).get({
      success:function(res){
           console.log(res)
           if(res.data.length<20){
            that.setData({
                  nomore:true,
            })
            console.log('没有更多了')
           }
           that.setData({
             list:res.data,
           })
            //开始监听刚刚这20条记录的变化
           //以防其他跑腿员已点击接单，而我这边数据还没有更新，就会导致出错
           let watcher = db.collection('publish')
           // 按 creat 降序
           .orderBy('creat', 'desc')
           // 取按 orderBy 排序之后的前 20 个
           .limit(that.data.list.length)
           .where(obj)
           .watch({
                 onChange: function(snapshot) {
                       console.log('文档的更改事件：', snapshot.docChanges)
                       console.log('事件后的查询结果快照：', snapshot.docs)
                       console.log('初始化type的值为init：', snapshot.type)
                       //判断导航，以防导航和列表不对应，不对应则关闭监听。
                       if(that.data.tab!=="帮我买"||that.data.list.length>20){
                             //如果不是对于的导航标，则关闭该导航标的监听，不要污染list数据
                             watcher.close();
                       }
                       if(that.data.tab=="帮我买"){
                             //snapshot.docs是新的查询结果
                             that.setData({
                                   list:snapshot.docs
                             })
                       }
                 },
                 onError: function(err) {
                       console.error('the watch closed because of error', err)
                 }
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
  //获取帮我送的单子列表
  get_song:function(obj){
    let that = this;
    db.collection('publish').where(obj).orderBy('creat', 'desc').limit(20).get({
      success:function(res){
           console.log(res)
           if(res.data.length<20){
            that.setData({
                  nomore:true,
            })
            console.log('没有更多了')
            }
           that.setData({
             list:res.data,
           })
            //开始监听刚刚这20条记录的变化
           //以防其他跑腿员已点击接单，而我这边数据还没有更新，就会导致出错
           let watcher = db.collection('publish')
           // 按 creat 降序
           .orderBy('creat', 'desc')
           // 取按 orderBy 排序之后的前 20 个
           .limit(that.data.list.length)
           .where(obj)
           .watch({
                 onChange: function(snapshot) {
                       console.log('文档的更改事件：', snapshot.docChanges)
                       console.log('事件后的查询结果快照：', snapshot.docs)
                       console.log('初始化type的值为init：', snapshot.type)
                       //判断导航，以防导航和列表不对应，不对应则关闭监听。
                       if(that.data.tab!=="帮我送"||that.data.list.length>20){
                             //如果不是对于的导航标，则关闭该导航标的监听，不要污染list数据
                             watcher.close();
                       }
                       if(that.data.tab=="帮我送"){
                             //snapshot.docs是新的查询结果
                             that.setData({
                                   list:snapshot.docs
                             })
                       }
                 },
                 onError: function(err) {
                       console.error('the watch closed because of error', err)
                 }
           })
      },
      fail(){
         //提示用户获取失败
         wx.showToast({
           title: '获取失败，请重新获取',
           icon: 'none',
           duration: 2000
         })
      }
    })
  },
   //获取帮我取的单子列表
   get_qu:function(obj){
    let that = this;
    db.collection('publish').where(obj).orderBy('creat', 'desc').limit(20).get({
      success:function(res){
           console.log(res)
           if(res.data.length<20){
                  that.setData({
                        nomore:true,
                  })
                  console.log('没有更多了')
           }
           that.setData({
             list:res.data,
           })
            //开始监听刚刚这20条记录的变化
           //以防其他跑腿员已点击接单，而我这边数据还没有更新，就会导致出错
           let watcher = db.collection('publish')
           // 按 creat 降序
           .orderBy('creat', 'desc')
           // 取按 orderBy 排序之后的前 20 个
           .limit(that.data.list.length)
           .where(obj)
           .watch({
                 onChange: function(snapshot) {
                       console.log('文档的更改事件：', snapshot.docChanges)
                       console.log('事件后的查询结果快照：', snapshot.docs)
                       console.log('初始化type的值为init：', snapshot.type)
                       //判断导航，以防导航和列表不对应，不对应则关闭监听。
                       if(that.data.tab!=="帮我取"||that.data.list.length>20){
                             //如果不是对于的导航标，则关闭该导航标的监听，不要污染list数据
                             watcher.close();
                       }
                       if(that.data.tab=="帮我取"){
                             //snapshot.docs是新的查询结果
                             that.setData({
                                   list:snapshot.docs
                             })
                       }
                 },
                 onError: function(err) {
                       console.error('the watch closed because of error', err)
                 }
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
  get_quanduo:function(obj){
      let that = this;
      let page = that.data.page + 1;
      console.log(obj)
      //经过上一句执行，page的值已经为1了，所以下面的page*20=20，下标20就是第21条记录
      db.collection('publish').where(obj).orderBy('creat', 'desc').skip(page * 20).limit(20).get({
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
                  
                  let watcher = db.collection('publish').where(obj)
                  // 按 creat 降序
                  .orderBy('creat', 'desc')
                  
                  .limit(that.data.list.length)
                  .watch({
                    onChange: function(snapshot) {
                          console.log('文档的更改事件：', snapshot.docChanges)
                          console.log('事件后的查询结果快照：', snapshot.docs)
                          console.log('初始化type的值为init：', snapshot.type)
                          //判断导航，以防导航和列表不对应，不对应则关闭监听。
                          if(that.data.tab!=="全部"){
                                //如果不是对于的导航标，则关闭该导航标的监听，不要污染list数据
                                watcher.close();
                          }
                          if(that.data.tab=="全部"){
                                //snapshot.docs是新的查询结果
                                that.setData({
                                      list:snapshot.docs
                                })
                          }
                    },
                    onError: function(err) {
                          console.error('the watch closed because of error', err)
                    }
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
  get_maiduo:function(obj){
        let that = this;
        let page = that.data.page + 1;
        //经过上一句执行，page的值已经为1了，所以下面的page*20=20
        db.collection('publish').where(obj).orderBy('creat', 'desc').skip(page * 20).limit(20).get({
              success: function(res) {
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
                  
                  let watcher = db.collection('publish').where(obj)
                  // 按 creat 降序
                  .orderBy('creat', 'desc')
                  
                  .limit(that.data.list.length)
                  .watch({
                    onChange: function(snapshot) {
                          console.log('文档的更改事件：', snapshot.docChanges)
                          console.log('事件后的查询结果快照：', snapshot.docs)
                          console.log('初始化type的值为init：', snapshot.type)
                          //判断导航，以防导航和列表不对应，不对应则关闭监听。
                          if(that.data.tab!=="帮我买"){
                                //如果不是对于的导航标，则关闭该导航标的监听，不要污染list数据
                                watcher.close();
                          }
                          if(that.data.tab=="帮我买"){
                                //snapshot.docs是新的查询结果
                                that.setData({
                                      list:snapshot.docs
                                })
                          }
                    },
                    onError: function(err) {
                          console.error('the watch closed because of error', err)
                    }
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
  get_songduo:function(obj){
        let that = this;
        let page = that.data.page + 1;
        //经过上一句执行，page的值已经为1了，所以下面的page*20=20
        db.collection('publish').where(obj).orderBy('creat', 'desc').skip(page * 20).limit(20).get({
              success: function(res) {
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
                  
                  let watcher = db.collection('publish').where(obj)
                  // 按 creat 降序
                  .orderBy('creat', 'desc')
                 
                  .limit(that.data.list.length)
                  .watch({
                    onChange: function(snapshot) {
                          console.log('文档的更改事件：', snapshot.docChanges)
                          console.log('事件后的查询结果快照：', snapshot.docs)
                          console.log('初始化type的值为init：', snapshot.type)
                          //判断导航，以防导航和列表不对应，不对应则关闭监听。
                          if(that.data.tab!=="帮我送"){
                                //如果不是对于的导航标，则关闭该导航标的监听，不要污染list数据
                                watcher.close();
                          }
                          if(that.data.tab=="帮我送"){
                                //snapshot.docs是新的查询结果
                                that.setData({
                                      list:snapshot.docs
                                })
                          }
                    },
                    onError: function(err) {
                          console.error('the watch closed because of error', err)
                    }
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
  get_quduo:function(obj){
        let that = this;
        let page = that.data.page + 1;
      //经过上一句执行，page的值已经为1了，所以下面的page*20=20
      db.collection('publish').where(obj).orderBy('creat', 'desc').skip(page * 20).limit(20).get({
            success: function(res) {
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
                  
                  let watcher = db.collection('publish').where(obj)
                  // 按 creat 降序
                  .orderBy('creat', 'desc')
                  
                  .limit(that.data.list.length)
                  .watch({
                    onChange: function(snapshot) {
                          console.log('文档的更改事件：', snapshot.docChanges)
                          console.log('事件后的查询结果快照：', snapshot.docs)
                          console.log('初始化type的值为init：', snapshot.type)
                          //判断导航，以防导航和列表不对应，不对应则关闭监听。
                          if(that.data.tab!=="帮我取"){
                                //如果不是对于的导航标，则关闭该导航标的监听，不要污染list数据
                                watcher.close();
                          }
                          if(that.data.tab=="帮我取"){
                                //snapshot.docs是新的查询结果
                                that.setData({
                                      list:snapshot.docs
                                })
                          }
                    },
                    onError: function(err) {
                          console.error('the watch closed because of error', err)
                    }
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
        let that = this;
        
        //进来这个页面是两种人，第一种是无权限接单的，第二种是有权限接单的人
        //查询就知道有没有
        //这个get_quanxian函数放在onshow这里，还能常更新权限
        //先获取缓存
        that.getStorage();  
         
  },
  getStorage:function(){
        let that = this;
        //做缓存，避免过多的查询表
        wx.getStorage({
              key: 'campus',
              success (res) {
                    console.log(res.data)
                    //把缓存的campus赋给全局变量campus
                    app.globalData.campus = res.data;
                     //实时刷新单子列表
                     if(that.data.tab=='全部'){
                        let cha_obj = {
                              state:_.in([1, 3]),
                              choose_campus:app.globalData.campus,
                        }
                        that.get(cha_obj);
                        }
                        if(that.data.tab=='帮我买'){
                        //获取帮我买的单子列表
                        let cha_obj = {
                                    state:1,
                                    choose_campus:app.globalData.campus,
                                    category:'帮我买',
                              }
                              that.get_mai(cha_obj);
                        }
                        if(that.data.tab=='帮我送'){
                        //获取帮我送的单子列表
                        let cha_obj = {
                                    state:1,
                                    choose_campus:app.globalData.campus,
                                    category:'帮我送',
                              }
                              that.get_song(cha_obj);
                        }
                        if(that.data.tab=='帮我取'){
                        //获取帮我取的单子列表
                        let cha_obj = {
                                    state:1,
                                    choose_campus:app.globalData.campus,
                                    category:'帮我取',
                        }
                              that.get_qu(cha_obj);
                        }
              },
              fail(er){
                    console.log('还没存校区')
                    //第一次进来没有这个campus缓存，可以获取存进去
                    //获取用户的campus
                    that.get_quanxian();
              }
        })
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
    //触底了就触发函数，去获取更多数据
    let that = this
    console.log('触底了')
    console.log(that.data.nomore)
    console.log(that.data.list.length)
    if (that.data.nomore || that.data.list.length < 20) {
      wx.showToast({
        title: '没有更多了',
      })
      return false;
    }
    console.log(app.globalData.campus)
    //无权限
    if(app.globalData.campus==''){
             //实时刷新单子列表
            if(that.data.tab=='全部'){
                  let cha_obj = {
                        state:_.in([1, 3]),
                  }
                  that.get_quanduo(cha_obj);
            }
            if(that.data.tab=='帮我买'){
                  //获取帮我买的单子列表
                  let cha_obj = {
                        state:1,
                        category:'帮我买'
                  }
                  that.get_maiduo(cha_obj);
            }
            if(that.data.tab=='帮我送'){
                  //获取帮我送的单子列表
                  let cha_obj = {
                        state:1,
                        category:'帮我送'
                  }
                  that.get_songduo(cha_obj);
            }
            if(that.data.tab=='帮我取'){
                  //获取帮我取的单子列表
                  let cha_obj = {
                        state:1,
                        category:'帮我取'
                  }
                  that.get_quduo(cha_obj);
            }
    }
    //有权限
    if(app.globalData.campus!==''){
          //实时刷新单子列表
            if(that.data.tab=='全部'){
                  let cha_obj = {
                        state:_.in([1, 3]),
                        choose_campus:app.globalData.campus,
                  }
                  that.get_quanduo(cha_obj);
            }
            if(that.data.tab=='帮我买'){
                  //获取帮我买的单子列表
                  let cha_obj = {
                        state:1,
                        choose_campus:app.globalData.campus,
                        category:'帮我买',
                  }
                  that.get_maiduo(cha_obj);
            }
            if(that.data.tab=='帮我送'){
                  //获取帮我送的单子列表
                  let cha_obj = {
                        state:1,
                        choose_campus:app.globalData.campus,
                        category:'帮我送',
                  }
                  that.get_songduo(cha_obj);
            }
            if(that.data.tab=='帮我取'){
                  //获取帮我取的单子列表
                  let cha_obj = {
                        state:1,
                        choose_campus:app.globalData.campus,
                        category:'帮我取',
                  }
                  that.get_quduo(cha_obj);
            }
    }
    
  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {

  }
})