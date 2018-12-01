// pages/notOrdered/orderGuide/orderGuide.js
Page({

  /**
   * 页面的初始数据
   */
  data: {
  a:0//跳转控制
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {

  },
  //跳转引导订购
  roder_list: function () {
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
      url: '/pages/notOrdered/orderList/orderList'
    });
    }
  },
  //跳转首页
  center: function () {
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
    console.log(wx.getStorageSync('ord'))
    if (wx.getStorageSync('ord') == 0) {
    } else {
      wx.redirectTo({
        url: '/pages/ordered/notice/notice'
      });
    }
    }
  },
  //跳转发布动态
  public: function () {
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
    if (wx.getStorageSync('ord') == 0) {
      wx.showModal({
        title: '提示信息',
        content: '您还没有订购业务！',
        showCancel: false,
        confirmText: "确定",
        success: function (res) {
        }
      });
    } else {
      wx.navigateTo({
      url: '/pages/ordered/publish/publish'
    });
    }
    }
  },
  //跳转我的
  my: function () {
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
    wx.redirectTo({
      url: '/pages/my/index/index'
    });
    }
  }
})