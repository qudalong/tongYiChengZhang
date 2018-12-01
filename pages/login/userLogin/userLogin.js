// pages/login/userLogin/userLogin.js
//60秒倒计时
var countdown = 60;
var settime = function (that) {
  if (countdown == 0) {
    that.setData({
      ifShowGetCode: false,
      ifShowReacquireTime: false,
      ifShowReacquire: true
    });
    countdown = 60;
    return;
  } else {
    that.setData({
      ifShowGetCode: false,
      ifShowReacquireTime: true,
      ifShowReacquire: false,
      last_time: countdown
    });
    countdown--;
  }
  setTimeout(function () {
    settime(that)
  }
    , 1000);
}
Page({
  //页面的初始数据
  data: {
    edition: '家长版',//版本
    phoneValue: '',//手机号
    phoneInputValue: '',//监听的手机号
    codeValue: '',//验证码
    phoneInputValue: '',//监听的验证码
    ifShowGetCode: true,//是否显示获取验证码
    ifShowReacquireTime: false,//是否显示重新获取
    ifShowReacquire: false,//是否显示重新获取验证码
    last_time: 60,//倒计时
    imsi: '12',//设备编号
    a: 0//点击事件控制
  },
  onLoad: function () {
    //微信授权
    wx.getUserInfo({
      success: function (res) {
        wx.setStorage({ key: "nickName", data: res.userInfo.nickName })// 	家长昵称（取微信 昵称）
        wx.setStorage({ key: "avatarUrl", data: res.userInfo.avatarUrl })// 	家长微信头像
      },
    });
    var url = getApp().globalData.url; //url+'

    wx.request({
      url: url + 'interface/sProgram/user/checkLoginBySessionID.do',
      data: {
        imsi: '12',
        sessionid: wx.getStorageSync('sessionid')
      },
      success: function (res) {
        console.log(res.data)
        if (res.data.rtnCode == 10000) {
          wx.setStorage({ key: "token", data: res.data.token })
          wx.setStorage({ key: "schoolID", data: res.data.rtnData[0].schoolID })//学校ID 3
          wx.setStorage({ key: "unitID", data: res.data.rtnData[0].unitID })//班级ID 
          wx.setStorage({ key: "unitName", data: res.data.rtnData[0].unitName })//班级名称
          wx.setStorage({ key: "studentID", data: res.data.rtnData[0].studentID })//学生ID 787 
          wx.setStorage({ key: "studentName", data: res.data.rtnData[0].studentName })//学生姓名
          wx.setStorage({ key: "userName", data: res.data.parent.name })//家长姓名
          wx.setStorage({ key: "usersid", data: res.data.parent.usersid })//当前家长ID 1198559
          wx.setStorage({ key: "parentSex", data: res.data.parent.sex })//家长性别
          wx.setStorage({ key: "photopath", data: res.data.parent.photopath })//家长头像
          wx.setStorage({ key: "phone", data: res.data.parent.phone })//当前登录手机号
          wx.setStorage({ key: "ord", data: res.data.rtnData[0].ord })//用户是否订购业务
          //判断用户是否订购业务
          if (res.data.rtnData[0].ord == 0) {//跳转订购引导页面
            wx.redirectTo({
              url: '/pages/notOrdered/orderGuide/orderGuide'
            });
          } else {//跳转动态首页
            wx.redirectTo({
              url: '/pages/ordered/notice/notice'
            });
          }
        } else {

        }
      }
    });
  },
  //获取验证码
  getCode: function (e) {
    var app = getApp();
    var phone = e.currentTarget.id
    var myreg = /^(((13[0-9]{1})|(15[0-9]{1})|(18[0-9]{1})|(17[0-9]{1}))+\d{8})$/;
    if (!myreg.test(phone)) {
      wx.showModal({
        title: '提示信息',
        content: '请输入正确的手机号',
        showCancel: false,
        success: function (res) {
        }
      });
    } else {
      //在这里调用获取手机验证码接口
      var url = getApp().globalData.url; //url+'
      wx.request({
        url: url + 'interface/sProgram/user/sendMessageLoginCode.do',
        data: {
          phone: e.currentTarget.id,
          sessionid: wx.getStorageSync('sessionid')
        },
        success: function (res) {
          if (res.data.rtnCode == 10000) {
            wx.showToast({
              title: '发送成功',
              icon: 'success',
              duration: 2000
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
      this.setData({
        ifShowGetCode: false,
        ifShowReacquireTime: true
      });
      settime(this);
    }
  },

  //清除输入的手机号
  clearPhoneInput: function () {
    this.setData({
      phoneValue: '',
      phoneInputValue: ''
    });
  },

  //监听手机号输入
  bindPhoneInput: function (e) {
    this.setData({
      phoneInputValue: e.detail.value
    });
  },

  //清除输入的验证码
  clearCodeInput: function () {
    this.setData({
      codeValue: '',
      codeInputValue: ''
    });
  },

  //监听验证码输入
  bindCodeInput: function (e) {
    this.setData({
      codeInputValue: e.detail.value
    });
  },

  //用户登录
  formSubmit: function (e) {
    var that = this;
    if (that.data.a == 0) {
      // that.setData({
      //   a: 1
      // });
      var formData = e.detail.value;
      var url = getApp().globalData.url; //url+'
      var nickName = wx.getStorageSync('nickName');
      if (nickName == null) {
        nickName = '';
      }
      wx.showToast({
        title: 'loading...',
        icon: 'loading',
        duration: 200000
      });
      wx.request({
        url: url + 'interface/sProgram/user/checkLoginBySProgram.do',
        data: {
          loginName: that.data.phoneInputValue,
          code: that.data.codeInputValue,
          imsi: that.data.imsi,
          sessionid: wx.getStorageSync('sessionid'),
          nickName: nickName
        },
        success: function (res) {
         // console.log(res.data)
          //成功（10000）　失败（10001） 幼儿档案不完整（10002 返回10002时需要跳转到修改完善资料页面）
          wx.hideLoading();
          if (res.data.rtnCode == 10000) {
            // that.setData({
            //   a: 0
            // });
            //本地存储
            wx.setStorage({ key: "token", data: res.data.token })
            wx.setStorage({ key: "schoolID", data: res.data.rtnData[0].schoolID })//学校ID 3
            wx.setStorage({ key: "unitID", data: res.data.rtnData[0].unitID })//班级ID 
            wx.setStorage({ key: "unitName", data: res.data.rtnData[0].unitName })//班级名称
            wx.setStorage({ key: "studentID", data: res.data.rtnData[0].studentID })//学生ID 787 
            wx.setStorage({ key: "studentName", data: res.data.rtnData[0].studentName })//学生姓名
            wx.setStorage({ key: "userName", data: res.data.parent.name })//家长姓名
            wx.setStorage({ key: "usersid", data: res.data.parent.usersid })//当前家长ID 1198559
            wx.setStorage({ key: "parentSex", data: res.data.parent.sex })//家长性别
            wx.setStorage({ key: "photopath", data: res.data.parent.photopath })//家长头像
            wx.setStorage({ key: "phone", data: that.data.phoneInputValue })//当前登录手机号
            wx.setStorage({ key: "ord", data: res.data.rtnData[0].ord })//用户是否订购业务
            //判断用户是否订购业务
            if (res.data.rtnData[0].ord == 0) {//跳转订购引导页面
              wx.redirectTo({
                url: '/pages/notOrdered/orderGuide/orderGuide'
              });
            } else {//跳转动态首页
              wx.redirectTo({
                url: '/pages/ordered/notice/notice'
              });
            }
          } else if (res.data.rtnCode == 10002) {//返回10002时需要跳转到修改完善资料页面）
            //跳转完善个人资料
            wx.redirectTo({
              url: '/pages/login/userInfo/userInfo'
            });
          } else {//失败（10001）
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