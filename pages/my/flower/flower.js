// pages/my/flower/flower.js
Page({

  /**
   * 页面的初始数据
   */
  data: {
    flowerNum: '',//小红花数量
    walletNum: '',//贝豆数量
    nickName: '',//微信昵称
    avatarUrl: '',////微信头像
    parent_image: '',//宝宝家长头像
    studentName: '',//宝宝姓名
    monthNum: '',//本月合计
    yearNum: '',//本年合计
    rtnData: [],//小红花明细
    page: 0,   // 设置加载的第几次，默认是第一次  
    size: 10,  //返回数据的个数 
    a: 0//点击事件控制
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    var that = this;
    that.setData({
      studentName: wx.getStorageSync('studentName'),//宝宝姓名
      parent_image: wx.getStorageSync('photopath')//宝宝家长头像
    });
    var token = wx.getStorageSync('token');//token
    var url = getApp().globalData.url; //url+'
    //查询用户小红花总数
    wx.request({
      url: url + 'interface/sProgram/user/selectFlowerNumByStudent.do?studentId=' + wx.getStorageSync('studentID'),
      data: {},
      method: 'GET', // OPTIONS, GET, HEAD, POST, PUT, DELETE, TRACE, CONNECT 
      header: { token: token }, // 设置请求的 header  
      success: function (res) {
        console.log(res)
        if (res.data.rtnCode == 10000) {
          that.setData({
            yearNum: res.data.rtnData[0],//本年合计
            monthNum: res.data.rtnData[1]//本月合计
          });
        }
      }
    });
    this.flowerList();
    wx.getUserInfo({
      success: function (res) {
        that.setData({
          nickName: res.userInfo.nickName,
          avatarUrl: res.userInfo.avatarUrl
        });
      }
    });
  },
  //下一页
  onReachBottom: function () {
    // Do something when page reach bottom.
    this.flowerList();
    //console.log('circle 下一页');
  },
  //获取用户小红花明细
  flowerList: function () {
    var that = this;
    var token = wx.getStorageSync('token');//token
    var url = getApp().globalData.url; //url+'
    wx.request({
      url: url + 'interface/flower/queryFlowerpersonalByUsersID.do?studentId=' + wx.getStorageSync('studentID') + '&pageNo=' + that.data.page + '&pageSize=' + that.data.size,
      data: {},
      method: 'GET', // OPTIONS, GET, HEAD, POST, PUT, DELETE, TRACE, CONNECT 
      header: { token: token }, // 设置请求的 header  
      success: function (res) {
        if (res.data.rtnCode == 10000) {
          if (res.data.rtnData.length > 0) {
            that.setData({
              page: that.data.page + 1
            });
          }
          that.setData({
            rtnData: that.data.rtnData.concat(res.data.rtnData)
          });
        }
      }
    });
  },
  //规则
  flowerRules: function () {
    var that = this;
    if (that.data.a == 0) {
      that.setData({
        a: 1
      });
      setTimeout(function () {
        that.setData({
          a: 0
        });
      }, 1000)
      wx.showToast({
        title: 'loading...',
        icon: 'loading',
        duration: 2000
      });
      wx.navigateTo({
        url: '/pages/my/flowerRules/flowerRules'
      });
    }
  }
})