// pages/second_fabu/second_fabu.js
const app = getApp();
const db = wx.cloud.database();
Page({

  /**
   * 页面的初始数据
   */
  data: {
    notes:'',
    note_counts:0,
    campus:['请选择校区'],
    campus_show:false,
    choose_campus:'请选择校区',
    multiple:true,
    fileList:[],
    linshi:[],  //存放图片的临时地址

    phone:'',
    zifu:'',
    zifu_counts:0,
    biaoqian:[],

    avatarUrl:'',
    nickName:'',
    userInfo:'',
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
      let that = this;
      that.get_campus();
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
                         avatarUrl:res.userInfo.avatarUrl,
                         nickName:res.userInfo.nickName,
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


  check:function(){
    let that = this;
    if(that.data.choose_campus=='请选择校区'){
      wx.showToast({
        title: '请选择校区',
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
    if(that.data.fileList.length==0){
      wx.showToast({
        title: '请上传闲置物品图片',
        icon: 'none',
        duration: 2000
      })
      return false;
    }
    if(that.data.notes==''){
      wx.showToast({
        title: '请输入相关说明',
        icon: 'none',
        duration: 2000
      })
      return false;
    }
    if(that.data.zifu==''){
      wx.showToast({
        title: '请输入至少一个标签',
        icon: 'none',
        duration: 2000
      })
      return false;
    }
    that.get_biaoqian();
  },
  //处理标签
  get_biaoqian:function(){
    let that = this;
    wx.showLoading({
      title: '正在发布',
    })
    console.log(that.data.zifu.split("，"))
    let zifu_arr = that.data.zifu.split("，")
    that.setData({
        biaoqian:that.data.biaoqian.concat(zifu_arr)
    })
    console.log(that.data.biaoqian)
    that.add_second();
  },
  add_second:function(){
    let that = this;
    db.collection('second').add({
      data:{
         choose_campus:that.data.choose_campus,
         phone:that.data.phone,
         fileList:that.data.fileList,
         notes:that.data.notes,
         biaoqian:that.data.biaoqian,
         creat:new Date().getTime(),
         search_name:that.data.zifu + that.data.notes,
         avatarUrl:that.data.avatarUrl,
         nickName:that.data.nickName,
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
        console.log(er)
        wx.hideLoading()
        wx.showToast({
          title: '发布失败,请重试',
          icon: 'none',
          duration: 2000
        })
      }
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
  //获取用户输入的闲置物品相关内容
  noteInput(e){
    let that = this;
    console.log(e.detail.cursor)
    that.setData({
          note_counts: e.detail.cursor,
          notes: e.detail.value,
    })
  },
  zifuInput(e){
    let that = this;
    console.log(e.detail.cursor)
    that.setData({
          zifu_counts: e.detail.cursor,
          zifu: e.detail.value,
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