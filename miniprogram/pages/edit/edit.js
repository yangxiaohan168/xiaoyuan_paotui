const db = wx.cloud.database();
const app = getApp();

Page({

      /**
       * 页面的初始数据
       */
      data: {
            phone:'',
            wxnum:'',
            qqnum:'',
            email:'',
            dizhi:'',
            userInfo:'',
            campus:['请选择校区'],
            campus_show:false,
            choose_campus:'请选择校区',
      },
     
      onLoad() {
            let that = this;
            that.getdetail();
            that.get_campus();
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
      getdetail() {
            let that = this;
            db.collection('user').where({
                  _openid: app.globalData.openid
            }).get({
                  success: function(res) {
                        console.log(res)
                        let info = res.data[0];
                        that.setData({
                              phone: info.phone,
                              qqnum: info.qqnum,
                              wxnum: info.wxnum,
                              email: info.email,
                              dizhi:info.dormitory,
                              choose_campus:info.campus_name,
                              _id: info._id
                        })
                  },
                  fail() {
                        wx.showToast({
                              title: '获取失败',
                              icon: 'none'
                        })
                        setTimeout(function() {
                              wx.navigateBack({})
                        },1000)
                             
                  }
            })
      },
      //获取用户手机号
      getPhoneNumber: function(e) {
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
      dizhiInput(e) {
            let that = this;
            that.setData({
                  dizhi:e.detail.value,
            })
            
      },
      wxInput(e) {
            let that = this;
            that.setData({
                  wxnum:e.detail.value
            })
           
      },
      qqInput(e) {
            let that = this;
            that.setData({
                  qqnum:e.detail.value
            })
      },
      emInput(e) {
            let that = this;
            that.setData({
                  email:e.detail.value
            })
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
      
      //校检
      check:function() {
            let that = this;
            //校检手机
            console.log(that.data)
            if (that.data.phone==''||that.data.phone==='undefined') {
                  wx.showToast({
                        title: '请先获取您的电话',
                        icon: 'none',
                        duration: 2000
                  });
                  return false
            }
            //校检校区
            if (that.data.choose_campus=='请选择校区'||that.data.choose_campus==='undefined') {
                  wx.showToast({
                        title: '请选择您的校区',
                        icon: 'none',
                        duration: 2000
                  });
                  return false;
            }
            //校检地址
            if (that.data.dizhi==='undefined'||that.data.dizhi=='') {
                  wx.showToast({
                        title: '请先输入您的地址',
                        icon: 'none',
                        duration: 2000
                  });
                  return false
            }
            
            //校检邮箱
            console.log(that.data.email)
            if(that.data.email==='undefined'||that.data.email==''){
                  if (!(/^\w+((.\w+)|(-\w+))@[A-Za-z0-9]+((.|-)[A-Za-z0-9]+).[A-Za-z0-9]+$/.test(that.data.email))) {
                        wx.showToast({
                              title: '请输入常用邮箱',
                              icon: 'none',
                              duration: 2000
                        });
                        return false;
                  }
            }
            
            console.log(that.data.qqnum)
            if (!that.data.qqnum==='undefined') {
                  if (!(/^\s*[.0-9]{5,11}\s*$/.test(that.data.qqnum))) {
                        wx.showToast({
                              title: '请输入正确QQ号',
                              icon: 'none',
                              duration: 2000
                        });
                        return false;
                  }
            }
            //校检微信号
           
            if (!that.data.wxnum==='undefined') {
                  if (!(/^[a-zA-Z]([-_a-zA-Z0-9]{5,19})+$/.test(that.data.wxnum))) {
                        wx.showToast({
                              title: '请输入正确微信号',
                              icon: 'none',
                              duration: 2000
                        });
                        return false;
                  }
            }
            wx.showLoading({
                  title: '正在提交',
            })
            db.collection('user').where({
                  _openid:app.globalData.openid,
            }).get({
                  success:function(r){
                        console.log(r.data.length)
                        if(r.data.length==0){
                              db.collection('user').add({
                                    data: {
                                          phone: that.data.phone,
                                          dormitory:that.data.dizhi,
                                          qqnum: that.data.qqnum,
                                          email: that.data.email,
                                          wxnum: that.data.wxnum,
                                          userInfo: that.data.userInfo,
                                          campus_name:that.data.choose_campus,
                                          updatedate: new Date().getTime(),
                                          balance:0,
                                    },
                                    success: function(res) {
                                          console.log(res)
                                          wx.hideLoading();
                                          wx.showToast({
                                                title: '修改成功',
                                                icon: 'success'
                                          })
                                          wx.setStorage({
                                                key:"campus",
                                                data:that.data.choose_campus,
                                          })
                                          setTimeout(function() {
                                                wx.navigateBack({})
                                          },1000)
                                    },
                                    fail() {
                                          wx.hideLoading();
                                          wx.showToast({
                                                title: '修改失败，请重新提交',
                                                icon: 'none',
                                          })
                                    }
                              })
                        }else{
                              console.log('hahah')
                              db.collection('user').where({
                                    _openid:app.globalData.openid,
                              }).update({
                                    data: {
                                          phone: that.data.phone,
                                          dormitory:that.data.dizhi,
                                          qqnum: that.data.qqnum,
                                          email: that.data.email,
                                          wxnum: that.data.wxnum,
                                          userInfo: that.data.userInfo,
                                          campus_name:that.data.choose_campus,
                                          updatedate: new Date().getTime(),
                                    },
                                    success: function(res) {
                                          console.log(res)
                                          wx.hideLoading();
                                          wx.showToast({
                                                title: '修改成功',
                                                icon: 'success'
                                          })
                                          wx.setStorage({
                                                key:"campus",
                                                data:that.data.choose_campus,
                                          })
                                          setTimeout(function() {
                                                wx.navigateBack({})
                                          },1000)
                                    },
                                    fail() {
                                          wx.hideLoading();
                                          wx.showToast({
                                                title: '修改失败，请重新提交',
                                                icon: 'none',
                                          })
                                    }
                              })
                        }
                       
                  }
            })
            
      },
})