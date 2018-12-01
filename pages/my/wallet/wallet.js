// pages/my/wallet/wallet.js
Page({

  /**
   * 页面的初始数据
   */
  data: {
    remainbean: '',//剩余贝豆
    rtnData: [],//购买规则
    money: '',//金额
    beans: '',//充值+赠送的贝豆数量
    plus:'',//赠送数量
    currentIndex: ''//当前数组下标
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    var that = this;
    var token = wx.getStorageSync('token');//token
    var url = getApp().globalData.url; //url+'
    //个人剩余贝豆查询
    that.getRemainBeanByUserId();
    //贝豆充值规则
    wx.request({
      url: url + 'interface/wallet/selectAllBeanrule.do',
      data: {},
      method: 'GET', // OPTIONS, GET, HEAD, POST, PUT, DELETE, TRACE, CONNECT 
      header: { token: token }, // 设置请求的 header  
      success: function (res) {
        //console.log(res)
        if (res.data.rtnCode == 10000) {
          that.setData({
            rtnData: res.data.rtnData,
            money: res.data.rtnData[0].fee,
            beans: res.data.rtnData[0].beans + res.data.rtnData[0].plus
          });
        }
      }
    });
  },
  //个人剩余贝豆查询
  getRemainBeanByUserId: function () {
    var that = this;
    var token = wx.getStorageSync('token');//token
    var url = getApp().globalData.url; //url+'
    wx.request({
      url: url + 'interface/wallet/getRemainBeanByUserId.do?userId=' + wx.getStorageSync('usersid'),
      data: {},
      method: 'GET', // OPTIONS, GET, HEAD, POST, PUT, DELETE, TRACE, CONNECT 
      header: { token: token }, // 设置请求的 header  
      success: function (res) {
        if (res.data.rtnCode == 10000) {
          that.setData({
            remainbean: res.data.rtnData[0].remainbean,
          });
        }
      }
    });
  },
  //选中
  selected: function (e) {
    var index = e.currentTarget.id
    this.setData({
      currentIndex: index,
      money: this.data.rtnData[index].fee,
      beans: this.data.rtnData[index].beans + this.data.rtnData[index].plus,
    });
  },
  pay_order: function () {
    var that= this;
    //贝豆充值支付
    var token = wx.getStorageSync('token');//token
    var url = getApp().globalData.url; //url+'
    wx.request({
      url: url + 'interface/wallet/payBean.do',
      data: {
        userId: wx.getStorageSync('usersid'), //用户id
        price: that.data.money, //总价
        beannum: that.data.beans,//实际贝豆数量（充值+赠送的总数）
        presentBeannum: that.data.plus,//赠送贝豆数量（可以为0）
        terminalId: '12', //设备IMEI
        userUA: '1',//用户UA(浏览器标识)
        payStyle: 3, //1易宝手机支付；3微信支付; 4支付宝支付
        userType: 2,//2 家长
        sessionid: wx.getStorageSync('sessionid')
      },
      method: 'POST', // OPTIONS, GET, HEAD, POST, PUT, DELETE, TRACE, CONNECT 
      header: { token: token }, // 设置请求的 header 
      success: function (res) {
        //成功（10000）　失败（10001） 价格变动（10104）
        if (res.data.rtnCode == 10000) {
          //console.log(res.data.rtnData[0].timestamp)
          wx.requestPayment({
            'timeStamp': res.data.rtnData[0].timestamp,
            'nonceStr': res.data.rtnData[0].noncestr,
            'package': res.data.rtnData[0].prepayid,
            'signType': 'MD5',
            'paySign': res.data.rtnData[0].sign,
            'success': function (res) {
              //console.log(res);
              //console.log('success');
              //个人剩余贝豆查询
              that.getRemainBeanByUserId();
              wx.showModal({
                title: '提示信息',
                content: '恭喜你充值成功，贝豆+' + that.data.beans,
                showCancel: false,
                confirmText: "确定",
                success: function (res) {
                }
              });
            },
            'fail': function (res) {
             // console.log(res);
              //console.log('fail');
              wx.showModal({
                title: '提示信息',
                content: '充值失败，请稍后重试！',
                showCancel: false,
                confirmText: "确定",
                success: function (res) {
                }
              });
            },
            'complete': function (res) {
              //console.log(res); console.log('complete');
            }
          });

        } else if (res.data.rtnCode == 10001) {
          wx.showModal({
            title: '提示信息',
            content: res.data.result,
            showCancel: false,
            confirmText: "确定",
            success: function (res) {
            }
          });
        } else if (res.data.rtnCode == 10104) {
        }
      }
    });
  }
})