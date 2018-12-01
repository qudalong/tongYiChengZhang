// pages/notOrdered/orderList/orderList.js
//获取应用实例  
var app = getApp()
Page({
  data: {
    spServices: [],//短信订购业务列表
    noSpServices: [],//网络订购业务列表
    winWidth: 0,// 页面配置 
    winHeight: 0,
    currentTab: 0,// tab切换  
    a: 0//跳转控制
  },
  onLoad: function () {
    var that = this;
    /** 
     * 获取系统信息 
     */
    wx.getSystemInfo({
      success: function (res) {
        that.setData({
          winWidth: res.windowWidth,
          winHeight: res.windowHeight
        });
      }
    });
    /**
     * 获取我的业务
     */
    var that = this;
    var studentid = wx.getStorageSync('studentID');//学生ID
    var parentid = wx.getStorageSync('usersid');//当前家长ID1198559
    var token = wx.getStorageSync('token');//token
    var url = getApp().globalData.url; //url+'
    wx.request({//studentid=138621&parentid=1198559
      url: url + 'interface/parent/user/selectMyService.do?studentid=' + studentid + '&parentid=' + parentid,
      data: {},
      method: 'GET', // OPTIONS, GET, HEAD, POST, PUT, DELETE, TRACE, CONNECT 
      header: { token: token }, // 设置请求的 header  
      success: function (res) {
        //console.log(res)
        if (res.data.rtnCode == 10000) {
          that.setData({
            spServices: res.data.spServices,
            noSpServices: res.data.noSpServices,
          });
        }
      }
    });
  },
  /** 
     * 滑动切换tab 
     */
  bindChange: function (e) {
    var that = this;
    that.setData({ currentTab: e.detail.current });
  },
  /** 
   * 点击tab切换 
   */
  swichNav: function (e) {
    var that = this;
    if (this.data.currentTab === e.target.dataset.current) {
      return false;
    } else {
      that.setData({
        currentTab: e.target.dataset.current
      });
    }
  },
  roder_detail: function (e) {
    var that = this;
    var index = e.currentTarget.id
    var self = 1;
    if (this.data.currentTab == 0) {
      self = 2;
      // console.log('短信订购');
      //引导订购
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
          url: '/pages/notOrdered/orderDetail/orderDetail?serviceid=' + that.data.spServices[index].serviceid + '&self=' + that.data.spServices[index].selftype
        });
      }
    } else {
      //console.log('网上订购');
      //引导订购
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
          url: '/pages/notOrdered/orderDetail/orderDetail?serviceid=' + that.data.noSpServices[index].serviceid + '&self=' + that.data.noSpServices[index].selftype
        });
      }
    }
  }
})  