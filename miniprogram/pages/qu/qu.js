// pages/qu/qu.js
// 引入地图SDK核心类
var QQMapWX = require('../../util/qqmap-wx-jssdk.js');
// 实例化API核心类
var qqmapsdk = new QQMapWX({
    key: 'PBFBZ-Y3D66-JUWSY-M2MNG-MI2EZ-SPBBY' // 必填
});
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
    title:'',
    express:'',
    shoujian_name:'',
    polyline: [],
    distance:0,
    duration:0,
    phone:'',
    start_location:'请选择',
    end_location:'请选择',
    start_latitude:'',
    start_longitude:'',
    end_latitude:'',
    end_longitude:'',
    no_jisuan:false,

    starttime_show:false,
    endtime_show:false,
    start_time:'请选择取件时间',
    end_time:'请选择送达时间',
    minDate:new Date().getTime(),
    cost:3,
    error_red:false,
    notes:'',
    checked:false,
    user_parse:false,
    balance:0,
    user_id:'',
    note_counts:0,
    fileList:[],
    linshi:[],  //存放图片的临时地址
  },
  
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
        let that = this;
        if(options.id){
          wx.setNavigationBarTitle({
            title: '代取快递'
          })
         }
        //获取校区
        that.get_campus();
        //获取余额
        that.get_balance();
        //查询是否有自己发布的未确认的订单，如果有，则跳转确认，如果没有可以继续发布
        that.get_publish();
  },
    // 上传图片
    uploadToCloud(event) {
      let that = this;
     
      wx.chooseImage({
        count: 9,
        sizeType: ['original', 'compressed'],
        sourceType: ['album', 'camera'],
        success (res) {
          wx.showLoading({
            title: '正在上传',
          })    
          console.log(res)
          that.setData({
            linshi:that.data.linshi.concat(res.tempFilePaths)
          })
          console.log(that.data.linshi)
          //临时数组
          let lujin = "bangmai_img/" + new Date().getTime() +"-"+ Math.floor(Math.random() * 1000);
          const uploadTasks = that.data.linshi.map((item, index)  =>  that.uploadFilePromise(lujin+index, item)); //传给wx.cloud.uploadFile的cloudPath属性的值不能重复！！！巨坑，加个index就可以避免重复了
            Promise.all(uploadTasks)
            .then(data => {
              console.log(data)
              wx.hideLoading()
              wx.showToast({ 
                title: '上传成功', 
                icon: 'none' 
              });
              const newFileList = data.map(item => ({ url: item.fileID,isImage: true,}));
              console.log(newFileList)
              //每次上传成功后，都要清空一次临时数组，避免第二次重复上传，浪费存储资源，
              that.setData({ 
                fileList: that.data.fileList.concat(newFileList),
                linshi:[],
              });
              
            })
            .catch(e => {
              wx.showToast({ title: '上传失败', icon: 'none' });
              console.log(e);
            });
      
        }
      })
      
     
  },
   //上传到云存储，并且获得图片新路径
    uploadFilePromise(fileName, chooseResult) {
      return wx.cloud.uploadFile({
        cloudPath: fileName,
        filePath: chooseResult
      });
    },
  //预览图片
  previewImage:function(event){
    let that = this;
    console.log(event)
    wx.previewImage({
      urls: [event.currentTarget.dataset.url] // 需要预览的图片http链接列表
    })    
  },
  //删除图片
  delete:function(event){
    let that = this;
    console.log(event)
    let inde = event.currentTarget.dataset.id
    //删除数组里面的值
    that.data.fileList.splice(inde,1)
    that.setData({
        fileList:that.data.fileList,
    })
  },

  get_publish:function(){
    let that = this;
    db.collection('publish').where({
        state:5,
        _openid:app.globalData.openid,
    }).get({
       success:function(res){
          if(res.data.length==0){
            //没有则不做任何弹窗处理
            console.log('没有待确认的订单')
          }else{
            //如果还有未确认订单，则跳转确认页面
            wx.showModal({
              title: '提示',
              content: '您还有未确认的订单，请先确认',
              showCancel:false,
              confirmText:'前往确认',
              success (res) {
                if (res.confirm) {
                  console.log('用户点击确定')
                  wx.switchTab({
                    url: '/pages/fabu/fabu',
                  })
                } else if (res.cancel) {
                  console.log('用户点击取消')
                }
              }
            })
            
          }
          
       },
       fail(er){

       }
    })
  },
  //获取用户输入的取件短信内容
  noteInput(e) {
    let that = this;
    console.log(e.detail.cursor)
    that.setData({
          note_counts: e.detail.cursor,
          notes: e.detail.value,
    })
  },
  //获取用户输入的寄件地址
  onChange_inputstart:function(event){
    let that = this;
    that.setData({
       start_location:event.detail,
       no_jisuan:true,
       
    })
    console.log(that.data.start_location)
  },
   //获取用户输入的收件地址
   onChange_inputend:function(event){
    let that = this;
    that.setData({
       end_location:event.detail,
       no_jisuan:true,
       
    })
    console.log(that.data.end_location)
  },
  //获取钱包余额
  get_balance:function(){
    let that = this;
    db.collection('user').where({
       _openid:app.globalData.openid,
    }).get({
      success:function(res){
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
                      title: '发送错误，请重试',
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
              user_id:res.data[0]._id,
          })
        }
      }
   })
  },
  //获取用户选择的取件时间
  starttime_change:function(event){
      let that = this;
      console.log(event.detail.getValues())
      let time = event.detail.getValues()
      that.setData({
         start_time:time[0]+'/'+time[1]+'/'+time[2]+' '+time[3]+':'+time[4],
      })
  },
  //确定取件时间
  starttime_confirm:function(){
    let that = this;
    that.setData({
        starttime_show:false,
    })
    //当客户没有滑动选择时间的时候，默认为现在时间
    if(that.data.start_time=="请选择取件时间"){
      let nian = new Date().getFullYear();
      let yue = new Date().getMonth()+1;
      let ri = new Date().getDate();
      let shi = new Date().getHours();
      let fen = new Date().getMinutes();
      that.setData({
          start_time:nian+'/'+yue+'/'+ri+' '+shi+':'+fen
      })
    }
  },
  //取消取件时间
  starttime_cancel:function(){
    let that = this;
    that.setData({
      starttime_show:false,
    })
  },
  //跳转充值页面
  go_parse:function(){
    let that = this;
    wx.navigateTo({
      url: '/pages/recharge/recharge',
    })
  },
  //获取用户选择的送达时间
  endtime_change:function(event){
    let that = this;
    console.log(event.detail.getValues())
    let time = event.detail.getValues()
    that.setData({
       end_time:time[0]+'/'+time[1]+'/'+time[2]+' '+time[3]+':'+time[4],
    })
  },
  //确定送达时间
  endtime_confirm:function(){
    let that = this;
    that.setData({
        endtime_show:false,
    })
    //当客户没有滑动选择时间的时候，默认为现在时间
    if(that.data.end_time=="请选择送达时间"){
        let nian = new Date().getFullYear();
        let yue = new Date().getMonth()+1;
        let ri = new Date().getDate();
        let shi = new Date().getHours();
        let fen = new Date().getMinutes();
        that.setData({
            end_time:nian+'/'+yue+'/'+ri+' '+shi+':'+fen
        })
    }
  },
  //取消送达时间
  endtime_cancel:function(){
    let that = this;
    that.setData({
      endtime_show:false,
    })
  },
 
  //获取线路，并且计算距离
  get_xianlu(e) {
    var that = this;
    wx.showLoading({
      title: '正在获取',
    })
    //调用接口
    qqmapsdk.direction({
      mode: 'bicycling',//可选值：'driving'（驾车）、'walking'（步行）、'bicycling'（骑行），不填默认：'driving',可不填
      //from参数不填默认当前地址
      from:{
        latitude: that.data.start_latitude,
        longitude: that.data.start_longitude,

      },
      to:{
        latitude: that.data.end_latitude,
        longitude: that.data.end_longitude,
      },
      success: function (res) {
        console.log(res);
        
        var ret = res;
        var coors = ret.result.routes[0].polyline, pl = [];
        //坐标解压（返回的点串坐标，通过前向差分进行压缩）
        var kr = 1000000;
        for (var i = 2; i < coors.length; i++) {
          coors[i] = Number(coors[i - 2]) + Number(coors[i]) / kr;
        }
        //将解压后的坐标放入点串数组pl中
        for (var i = 0; i < coors.length; i += 2) {
          pl.push({ latitude: coors[i], longitude: coors[i + 1] })
        }
        console.log(pl)
        //设置polyline属性，将路线显示出来,将解压坐标第一个数据作为起点
        that.setData({
          latitude:pl[0].latitude,
          longitude:pl[0].longitude,
          polyline: [{
            points: pl,
            color: '#FF0000DD',
            width: 4
          }],
          distance:res.result.routes[0].distance,
          duration:res.result.routes[0].duration,
        })
        wx.hideLoading()
        if(that.data.user_parse&&that.data.balance>=that.data.cost){
          //使用钱包支付，先获取线路和计算距离，再调用parse_pay函数
          that.parse_pay();
          
        }
        if(!that.data.user_parse){
          //使用微信支付
          that.pay();
        }
        
        
      },
      fail: function (error) {
        console.error(error);
        wx.hideLoading()
        wx.showToast({
          title: '获取失败，请重试',
          icon: 'none',
          duration: 2000
        })
        
      },
      
    });
  },
  //选择取件地址
  choose_startlocation:function(){
    let that = this;
    wx.chooseLocation({
              success:function(res){
                 console.log(res)
                 that.setData({
                     start_location:res.name,
                     start_latitude:res.latitude,
                     start_longitude:res.longitude,
                 })
              }
    })
  },
  //选择送达地址
  choose_endlocation:function(){
    let that = this;
    wx.chooseLocation({
              success:function(res){
                 console.log(res)
                 that.setData({
                     end_location:res.name,
                     end_latitude:res.latitude,
                     end_longitude:res.longitude,
                 })
              },
    })
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
   //打开选择取件时间窗口
   popup_starttime:function(){
    let that = this;
    that.setData({
      starttime_show:true,
    })
  },
   //打开选择送达时间窗口
   popup_endtime:function(){
    let that = this;
    that.setData({
      endtime_show:true,
    })
  },
  //获取用户输入的任务标题
  onChange_title:function(event){
    let that = this;
    that.setData({
       title:event.detail,
    })
    console.log(that.data.title)
  },
   //获取用户输入的所属快递
   onChange_express:function(event){
    let that = this;
    that.setData({
       express:event.detail,
    })
    console.log(that.data.express)
  },
  //获取用户输入的收件人
  onChange_shoujian:function(event){
    let that = this;
    that.setData({
       shoujian_name:event.detail,
    })
    console.log(that.data.shoujian_name)
  },
  //获取用户输入的任务费用
  onChange_cost:function(event){
    let that = this;
    if(!/^\+?[1-9][0-9]*$/.test(event.detail)){
      wx.showToast({
        title: "请输入非零的正整数",
        icon: 'none',
      })
      that.setData({
        error_red:true,
      })
      return false;
    }
    //输入的是非零正整数，就赋值
    that.setData({
       cost:event.detail,
       error_red:false,
    })
    console.log(that.data.cost)
  },
  
  //确定是否是重物
  onChange_check:function(event){
    let that = this;
    console.log(event.detail)
    that.setData({
       checked:event.detail,
    })
  },
  //是否使用余额支付
  onChange_userparse:function(event){
    let that = this;
    console.log(event.detail)
    that.setData({
       user_parse:event.detail,
    })
  },
  //检查各个输入是否都已经输入
  onSubmit:function(){
    let that = this;
    if(that.data.choose_campus=='请选择校区'){
      wx.showToast({
        title: '请选择校区',
        icon: 'none',
        duration: 2000
      })
      return false;
    }
    if(that.data.title==''){
      wx.showToast({
        title: '请输入任务标题',
        icon: 'none',
        duration: 2000
      })
      return false;
    }
    // if(that.data.express==''){
    //   wx.showToast({
    //     title: '请输入所属快递',
    //     icon: 'none',
    //     duration: 2000
    //   })
    //   return false;
    // }
    if(that.data.shoujian_name==''){
      wx.showToast({
        title: '请输入收件人',
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
    if(that.data.start_location=='请选择'){
      wx.showToast({
        title: '请选择取件地址',
        icon: 'none',
        duration: 2000
      })
      return false;
    }
    if(that.data.end_location=='请选择'){
      wx.showToast({
        title: '请选择送达地址',
        icon: 'none',
        duration: 2000
      })
      return false;
    }
    // if(that.data.start_time=='请选择取件时间'){
    //   wx.showToast({
    //     title: '请选择取件时间',
    //     icon: 'none',
    //     duration: 2000
    //   })
    //   return false;
    // }
    if(that.data.end_time=='请选择送达时间'){
      wx.showToast({
        title: '请选择送达时间',
        icon: 'none',
        duration: 2000
      })
      return false;
    }
    if(!/^\+?[1-9][0-9]*$/.test(that.data.cost)){
      wx.showToast({
        title: '任务费用必须为非零的正整数',
        icon: 'none',
        duration: 2000
      })
      return false;
    }
    // if(that.data.notes==''){
    //   wx.showToast({
    //     title: '请填写备注（粘贴取件信息）',
    //     icon: 'none',
    //     duration: 2000
    //   })
    //   return false;
    // }
    if(that.data.user_parse&&that.data.balance<that.data.cost){
      wx.showModal({
        title: '提示',
        content: '余额不足，请充值',
        success (res) {
          if (res.confirm) {
            console.log('用户点击确定')
            wx.redirectTo({
              url: '/pages/parse/parse',
            })
          } else if (res.cancel) {
            console.log('用户点击取消')
          }
        }
      })
      return false;
    }
    if(that.data.user_parse&&that.data.balance>=that.data.cost){
      if(!that.data.no_jisuan){
          //使用钱包支付，先获取线路和计算距离，再调用parse_pay函数
          that.get_xianlu();
      }
      if(that.data.no_jisuan){
        that.parse_pay();
      }
        
    }
    if(!that.data.user_parse){

       //使用微信支付
       that.subscribeMessage();
       
    }
  },
  //使用钱包支付
  parse_pay:function(){
    let that = this;
    //这里采用事务，因为需要三个操作同时成功或者同时失败
    //第一个是减去钱包余额，第二是消费记录写入history数据库表，第三是写入publish数据库表
    console.log(that.data.user_id)
    console.log(app.globalData.openid)
    wx.showLoading({
      title: '正在支付',
    })
    wx.cloud.callFunction({
      name:'parse_pay',
      data:{
          user_id:that.data.user_id,
          cost:that.data.cost,
          name:'帮我取订单支付',
          stamp:new Date().getTime(),
          
      },
      success:function(res){
            console.log(res)
            //成功，则先获取抽成费率,再存入数据库
            if(res.result.success){
                that.get_rate();
            }
            //如果失败，则提示重试
            if(!res.result.success){
              wx.hideLoading()
              wx.showToast({
                title: '发布错误，请重试',
                icon: 'none',
                duration: 2000
              })
            }
           
            
      },
      fail(er){
        console.log(er)
      }
    })

  },
  //使用微信支付
  pay:function(){
    let that = this;
    wx.showLoading({
      title: '正在支付',
    })
    let dingdan_hao = Date.now().toString()+Math.floor(Math.random()*1000).toString()
    wx.cloud.callFunction({
      name: 'pay',  //云函数的名称，在后面我们会教大家怎么建
      data:{
          body:'优我帮-帮我取任务费用',
          outTradeNo:dingdan_hao,
          totalFee:that.data.cost,
          nonceStr:'5K8264ILTKCH16CQ2502SI8ZNMTM67VS'
      },
      success: res => {
        console.log(res)
        const payment = res.result.payment
        wx.hideLoading();
        wx.requestPayment({
          ...payment,           //...这三点是 ES6的展开运算符，用于对变量、数组、字符串、对象等都可以进行解构赋值。
          success (res) {
            console.log('支付成功', res)
            wx.showLoading({
              title: '正在完成',
            })
            //支付成功后，先获取抽成费率，再添加到publish数据库
            that.get_rate();
            let nian = new Date().getFullYear();
            let yue = new Date().getMonth()+1;
            let ri = new Date().getDate();
            let shi = new Date().getHours();
            let fen = new Date().getMinutes();
            //支付成功后，调用paysuc云函数发布订单支付成功提醒
            wx.cloud.callFunction({
              name:'paysuc',
              data:{
                trade_name:'优我帮-帮我取订单',
                cost:(that.data.cost).toString(),   //转成字符串
                payment_method:'微信支付',
                time:nian+'年'+yue+'月'+ri+'日'+' '+shi+':'+fen,
                dingdan_hao:dingdan_hao,
                
              },
              success:function(re){
                   console.log(re)
              },
              fail(e){
                 console.log(e)
              }
            })

          },
          fail (err) {
            console.error('支付失败', err) //支付失败之后的处理函数，写在这后面

          }
        })
      },
      fail: console.error,
    })
  },
  //请求获取发送订阅消息的权限
  subscribeMessage() {
    let that = this;
    wx.requestSubscribeMessage({
      tmplIds: [
        "HtZ_mS0WpFwT8AQAE72xrDKFWWoIle5OzJ83VYfwu5E",//订阅消息模板ID，一次可以写三个，可以是同款通知、到货通知、新品上新通知等，通常用户不会拒绝，多写几个就能获取更多授权
      ],
      success(res) {
        console.log("订阅消息API调用成功：",res)
        if(!that.data.no_jisuan){
          //使用钱包支付，先获取线路和计算距离，再调用parse_pay函数
          that.get_xianlu();
        }
        if(that.data.no_jisuan){
          that.pay();
        }
        
        
      },
      fail(res) {
        console.log("订阅消息API调用失败：",res)
      }
    })
  },
  //把输入的信息提交到publish数据库表
  add_publish:function(e){
    let that = this;
    db.collection('publish').add({
       data:{
           choose_campus:that.data.choose_campus,
           title:that.data.title,
           express:that.data.express,
           shoujian_name:that.data.shoujian_name,
           phone:that.data.phone,
           start_location:that.data.start_location,
           end_location:that.data.end_location,
           start_latitude:that.data.start_latitude,
           start_longitude:that.data.start_longitude,
           end_latitude:that.data.end_latitude,
           end_longitude:that.data.end_longitude,
           start_time:that.data.start_time,
           end_time:that.data.end_time,
           cost:e,   
           notes:that.data.notes,
           checked_zhong:that.data.checked,
           creat:new Date().getTime(),
           category:'帮我取',
           distance:that.data.distance,
           polyline: that.data.polyline,
           duration:that.data.duration,
           state:1,
           yuanjia:that.data.cost,
           fileList:that.data.fileList,
       },
       success:function(res){
            wx.hideLoading()
            wx.showToast({
              title: '发布成功',
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
         //存入数据库失败处理
        wx.showModal({
          title: '提示',
          content: '发布失败',
          confirmText:'联系客服',
          showCancel:false,
          success (res) {
            if (res.confirm) {
              console.log('用户点击确定')
              wx.navigateTo({
                url: '/pages/kefu/kefu',
              })
            } else if (res.cancel) {
              console.log('用户点击取消')

            }
          }
        })
       }
    })
  },
  //获取后台的抽成费率
  get_rate:function(){
    let that = this;
    db.collection('campus').where({
         campus_name:that.data.choose_campus,
    }).get({
      success:function(res){
           console.log(res.data[0].rate)
           let rate = 1-res.data[0].rate
          // 把抽成费率传给add_publish函数进行增加数据处理
          let cost = (rate*that.data.cost).toFixed(1)
          let costs = parseFloat(cost)
           that.add_publish(costs)
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