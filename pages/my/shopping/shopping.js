// pages/my/shopping/shopping.js
Page({

  /**
   * 页面的初始数据
   */
  data: {
    shop: ''
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    var that = this;
    var token = wx.getStorageSync('token');//token
    var url = getApp().globalData.url; //url+'
    //获取兑吧商城免登陆url
    var timestamp = Date.parse(new Date());
    timestamp = timestamp / 1000;
    wx.request({
      url: url + 'interface/duiba/autoLoginAdnRedirect.do?uid=' + wx.getStorageSync('usersid') + '&dbredirect' + timestamp,
      data: {},
      method: 'GET', // OPTIONS, GET, HEAD, POST, PUT, DELETE, TRACE, CONNECT 
      header: { token: token }, // 设置请求的 header  
      success: function (res) {
        that.setData({
          shop: res.data
        });
      }
    });
  }
})