// pages/apply/apply.js
const app = getApp();
const db = wx.cloud.database();
const _ = db.command;
Page({

  /**
   * 页面的初始数据
   */
  data: {
       phone:'',
       name:'',
       zheng_img:'/images/zhengmian.png',
       fan_img:'/images/fanmian.png',
       preview_fan:false,
       preview_zheng:false,
       show:1,  //show等于1代表可以提交信息，等于2代表等待审核或者违规无权限，等于3代表审核成功
       campus:['请选择校区'],
       campus_show:false,
       choose_campus:'请选择校区',
       cost:0,

       userInfo:'',
       runner_id:'',
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
         let that = this;
         //进来就调用get函数，先检查runner数据库表有没有这个人，
         //如果没有，则可以提交信息
         //如果有，则显示等待审核或者违规无权限，
         //如果有并且审核通过，显示审核成功
         that.get();
         //获取校区
         that.get_campus();
         
  },
  //退押金
  tui_yajin:function(){
    let that = this
    wx.showLoading({
      title: '正在处理',
    })
    //先检查order表里是否还有未完成的订单，有则不给退押金
    db.collection('order').where({
      category: _.or(1, 4),
	  _openid:app.globalData.openid,
    }).get({
      success:function(res){
          if(res.data.length==0){
            wx.hideLoading()
             wx.showModal({
              title: '提示',
              content: '退押金后，不能再接单哦，确定吗',
              success (res) {
                if (res.confirm) {
                  console.log('用户点击确定')
                  wx.showLoading({
                    title: '正在处理',
                  })
                   // 没有，可以给提现
                   that.tui();
                } else if (res.cancel) {
                  console.log('用户点击取消')
                }
              }
            })
            
            
          }
          if(res.data.length!==0){
            // 有，不给提现
            wx.hideLoading()
            wx.showToast({
              title: '您还有未完成的订单，请先完成',
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
  tui:function(){
    let that = this;
    let nian = new Date().getFullYear();
    let yue = new Date().getMonth()+1;
    let ri = new Date().getDate();
    let shi = new Date().getHours();
    let fen = new Date().getMinutes();
    wx.cloud.callFunction({
      name:'tui_yajin',
      data:{
          runner_id:that.data.runner_id,
          time:nian+'年'+yue+'月'+ri+'日'+' '+shi+':'+fen,
      },
      success:function(res){
        if(res.result.success){  
          //成功后，要重新获取新数据，
          
          wx.hideLoading()
          wx.showToast({
                title: '处理成功',
                icon: 'success',
                duration: 2000
          })
          setTimeout(function(){
            wx.reLaunch({
              url: '/pages/index/index',
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
  //获取押金金额
  get_cost:function(){
    let that = this;
    wx.showLoading({
      title: '正在获取',
    })
    db.collection('campus').where({
        campus_name:that.data.choose_campus,
    }).get({
      success:function(res){
        //获取成功后赋值给cost
         that.setData({
            cost:res.data[0].cost,
         })
         wx.hideLoading();
         //获取成功后，开始支付
         that.pay();
      },
      fail(er){
         wx.hideLoading();
         wx.showToast({
          title: '获取失败，请重试',
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
   //查询该用户的交押金状态
   get:function(){
     let that = this;
     db.collection('runner').where({
         _openid:app.globalData.openid,
     }).get({
       success:function(res){
            
            //还没提交信息
            if(res.data.length==0){
                 //不做任何处理
            }
            if(res.data.length!==0){
               //有但还没有审核通过或者违规无权限
               if(res.data[0].pass==false){
                   that.setData({
                     show:2,
                   })
               }
               //有而且审核通过
               if(res.data[0].pass==true){
                  that.setData({
                    show:3,
                    runner_id:res.data[0]._id,
                    
                  })
               }
            }
       }
     })
   },
    //获取用户手机号
    get_phone: function(e) {
      let that = this;
      //判断用户是否授权确认
      if (!e.detail.errMsg || e.detail.errMsg != "getPhoneNumber:ok") {
            wx.showToast({
                  title: '获取手机号失败',
                  icon: 'none'
            })
            return;
      }
      wx.showLoading({
            title: '获取手机号中...',
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
    onChange:function(event){
      let that = this;
      that.setData({
         name:event.detail,
      })
      console.log(that.data.name)
    },
    getUserProfile(e) {
      // 推荐使用wx.getUserProfile获取用户信息，开发者每次通过该接口获取用户个人信息均需用户确认
      // 开发者妥善保管用户快速填写的头像昵称，避免重复弹窗
      let that = this;
      if(that.data.userInfo!==''){
            that.upload_zheng();
      }
      if(that.data.userInfo==''){
            wx.getUserProfile({
                  desc: '用于完善用户资料', // 声明获取用户个人信息后的用途，后续会展示在弹窗中，请谨慎填写
                  success: (res) => {
                        that.setData({
                           userInfo: res.userInfo,
                        })
                        console.log(that.data.userInfo)
                        that.upload_zheng();
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
    //上传身份证正面图片
   upload_zheng:function(){
      let that = this;
       //选择图片
       wx.chooseImage({
        count : 1, //规定选择图片的数量，默认9
        sizeType : ['original','compressed'], //规定图片的尺寸， 原图/压缩图
        sourceType : ['album','camera'], //从哪里选择图片， 相册/相机
        success : (chooseres)=>{ //接口调用成功的时候执行的函数
            console.log(chooseres);
            wx.showLoading({
              title: '图片上传中',
            })
            //选择图片后可以在这里上传
            wx.cloud.uploadFile({
              cloudPath: "sheng_img/" + new Date().getTime() +"-"+ Math.floor(Math.random() * 1000),//云储存的路径及文件名
              filePath : chooseres.tempFilePaths[0], //要上传的图片/文件路径 这里使用的是选择图片返回的临时地址
              success : (uploadres) => { 
                //上传图片到云储存成功,拿到了图片地址
                console.log(uploadres)
                 that.setData({
                   zheng_img:uploadres.fileID,
                   preview_zheng:true,
                 })  
                  wx.hideLoading();
                  wx.showToast({
                      title: '图片上传成功',
                      icon: 'success',
                      duration: 2000
                  })
              },
              fail : (err) => {
                console.log(err)
              }
            })
        },
        fail : (err) => {
          console.log(err)
        }
    })
    },
    //预览正面图片
    preview_zheng:function(){
       let that = this;
       wx.previewImage({
        urls: [that.data.zheng_img] // 需要预览的图片http链接列表
      })
    },
    //上传身份证反面图片
    upload_fan:function(){
      let that = this;
       //选择图片
       wx.chooseImage({
        count : 1, //规定选择图片的数量，默认9
        sizeType : ['original','compressed'], //规定图片的尺寸， 原图/压缩图
        sourceType : ['album','camera'], //从哪里选择图片， 相册/相机
        success : (chooseres)=>{ //接口调用成功的时候执行的函数
            console.log(chooseres);
            wx.showLoading({
              title: '图片上传中',
            })
            //选择图片后可以在这里上传
            wx.cloud.uploadFile({
              cloudPath: "sheng_img/" + new Date().getTime() +"-"+ Math.floor(Math.random() * 1000),//云储存的路径及文件名
              filePath : chooseres.tempFilePaths[0], //要上传的图片/文件路径 这里使用的是选择图片返回的临时地址
              success : (uploadres) => { 
                //上传图片到云储存成功,拿到了图片地址
                console.log(uploadres)
                 that.setData({
                   fan_img:uploadres.fileID,
                   preview_fan:true,
                 })  
                  wx.hideLoading();
                  wx.showToast({
                      title: '图片上传成功',
                      icon: 'success',
                      duration: 2000
                  })
              },
              fail : (err) => {
                console.log(err)
              }
            })
        },
        fail : (err) => {
          console.log(err)
        }
    })
    },
    //预览反面图片
    preview_fan:function(){
       let that = this;
       wx.previewImage({
        urls: [that.data.fan_img] // 需要预览的图片http链接列表
      })
    },

    //检查用户的输入是否齐全
    check:function(){
      let that = this;
      if(that.data.name==""){
        wx.showToast({
          title: '请输入姓名',
          icon: 'none',
          duration: 2000
        })
        //需要return,停止往下执行，不然当满足多个条件时，会弹出絮乱
        return false;
      }
      if(that.data.choose_campus=="请选择校区"){
        wx.showToast({
          title: '请选择您的校区',
          icon: 'none',
          duration: 2000
        })
        return false;
      }
      if(that.data.phone==""){
        wx.showToast({
          title: '请获取手机号码',
          icon: 'none',
          duration: 2000
        })
        return false;
      }
      if(that.data.zheng_img=='/images/zhengmian.png'){
        wx.showToast({
          title: '请上传身份证正面照片',
          icon: 'none',
          duration: 2000
        })
        return false;
      }
      if(that.data.fan_img=='/images/fanmian.png'){
        wx.showToast({
          title: '请上传身份证反面照片',
          icon: 'none',
          duration: 2000
        })
        return false;
      }
      //接下来获取押金金额
      that.get_cost();
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
          body:'优我帮-接单押金',
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
            //支付成功后，再添加到runner数据库
            that.add_runner();
            let nian = new Date().getFullYear();
            let yue = new Date().getMonth()+1;
            let ri = new Date().getDate();
            let shi = new Date().getHours();
            let fen = new Date().getMinutes();
            //支付成功后，调用paysuc云函数发布订单支付成功提醒
            wx.cloud.callFunction({
              name:'paysuc',
              data:{
                trade_name:'优我帮-接单押金',
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
        //先获取检查输入值，再获取押金金额，再支付
        that.check();
        
      },
      fail(res) {
        console.log("订阅消息API调用失败：",res)
      }
    })
  },
  //把数据存入runner数据库表
  add_runner:function(){
    let that = this;
    let nian = new Date().getFullYear();
    let yue = new Date().getMonth()+1;
    let ri = new Date().getDate();
    let shi = new Date().getHours();
    let fen = new Date().getMinutes();
    db.collection('runner').add({
      data:{
          name:that.data.name,
          campus:that.data.choose_campus,
          phone:that.data.phone,
          zheng_img:that.data.zheng_img,
          fan_img:that.data.fan_img,
          creat:new Date().getTime(),
          cost:that.data.cost,
          time:nian+'年'+yue+'月'+ri+'日'+' '+shi+':'+fen,
          pass:false,
          userInfo:that.data.userInfo,
          avatarUrl:that.data.userInfo.avatarUrl,
          nickName:that.data.userInfo.nickName,

      },
      success:function(res){
          wx.hideLoading()
          wx.showToast({
            title: '支付成功',
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
          wx.showModal({
            title: '提示',
            content: '提交数据出错，请联系客服',
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