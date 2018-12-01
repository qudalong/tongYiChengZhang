// pages/login/userInfo/userInfo.js
Page({
  //页面的初始数据
  data: {
    array: ['女', '男'],//性别列表
    relationList: [],//关系列表
    index: 1,//性别下标
    index2: 1,//关系下标
    birthday: '请选择（必填）',//生日（2016-11-11）
    studentName: '',//学生姓名
    sex: '',//学生性别 1男0女
    relation: '',//与家长的关系编号
    relationName: '',//与家长的关系名称
    a: 0//点击事件控制
  },
  /**
  * 生命周期函数--监听页面加载
  */
  onLoad: function (options) {
    var that = this;
    that.setData({
      studentName: wx.getStorageSync('studentName')
    });
    var token = wx.getStorageSync('token');//token
    var url = getApp().globalData.url; //url+'
    //查询全部宝宝与家长关系名称
    wx.request({
      url: url +'interface/sProgram/user/getContactRole.do',
      data: {},
      method: 'GET', // OPTIONS, GET, HEAD, POST, PUT, DELETE, TRACE, CONNECT 
      header: { token: token }, // 设置请求的 header  
      success: function (res) {
        if (res.data.rtnCode == 10000) {
          for (var i = 0; i < res.data.rtnData.length; i++) {
            wx.setStorage({ key: res.data.rtnData[i].text, data: res.data.rtnData[i].value })//
            that.setData({
              relationList: that.data.relationList.concat(res.data.rtnData[i].text)
            });
          }
        } else {
        }
      }
    });
  },
  bindPickerChange: function (e) {
    this.setData({
      index2: e.detail.value
    });
  },
  bindDateChange: function (e) {
    this.setData({
      birthday: e.detail.value
    });
  },
  bindTimeChange: function (e) {
    this.setData({
      time: e.detail.value
    });
  },
  /**
   * 完善个人信息
   */
  formSubmit: function (e) {
    var formData = e.detail.value;
    var that = this;
    if (that.data.a == 0) {
      that.setData({
        a: 1
      });
    wx.showToast({
      title: 'loading...',
      icon: 'loading',
      duration: 200000
    });
    var token = wx.getStorageSync('token');//token
    var url = getApp().globalData.url; //url+'
    wx.request({
      url: url +'interface/sProgram/user/updateUsersMessage.do',
      data: {
        schoolID: wx.getStorageSync('schoolID'),//学校ID
        unitID: wx.getStorageSync('unitID'),//班级ID
        unitName: wx.getStorageSync('unitName'),//班级名称
        studentID: wx.getStorageSync('studentID'),// 	学生ID
        studentName: wx.getStorageSync('studentName'),//学生姓名
        sex: that.data.index,// 	学生性别 1男0女
        birthday: that.data.birthday,//生日（2016-11-11）
        relation: wx.getStorageSync(this.data.relationList[this.data.index2]),//与家长的关系编号
        relationName: that.data.relationList[that.data.index2],//与家长的关系名称
        firster: wx.getStorageSync('usersid'),//当前家长ID1198559
        parentSex: wx.getStorageSync('parentSex'),//家长性别
        nickName: wx.getStorageSync('nickName')// 	家长昵称（取微信 昵称）
      },
      method: 'POST', // OPTIONS, GET, HEAD, POST, PUT, DELETE, TRACE, CONNECT 
      header: { token: token }, // 设置请求的 header  
      success: function (res) {
        wx.hideLoading();
        if (res.data.rtnCode == 10000) {
          that.setData({
            a: 0
          });
          //跳转引导订购
          wx.redirectTo({
            url: '/pages/notOrdered/orderGuide/orderGuide'
          });
        } else {
          wx.showModal({
            title: '提示信息',
            content: res.data.result,
            showCancel: false,
            confirmText: "确定",
            success: function (res) {
            }
          });
        }
      }
    });
    }
  }
})