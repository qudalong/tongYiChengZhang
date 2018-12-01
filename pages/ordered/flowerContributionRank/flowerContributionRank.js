// pages/ordered/flowerContributionRank/flowerContributionRank.js
Page({
  /**
   * 页面的初始数据
   */
  data: {
    arrarList: []
  },
  onLoad: function (options) {
    var that = this;
    var dynamicid = options.dynamicid;//动态id
    var token = wx.getStorageSync('token');//token
    var url = getApp().globalData.url; //url+'
    wx.request({
      url: url +'interface/sProgram/user/selectSendFlowerRank.do?dynamicid=' + dynamicid + '&page=0&size=' + 60,
      data: {},
      method: 'GET', // OPTIONS, GET, HEAD, POST, PUT, DELETE, TRACE, CONNECT 
      header: { token: token }, // 设置请求的 header  
      success: function (res) {
        console.log(res)
        if (res.data.rtnCode == 10000) {
          that.setData({
            arrarList: res.data.rtnData
          });
        } else {
        }
      }
    });
  },
}) 