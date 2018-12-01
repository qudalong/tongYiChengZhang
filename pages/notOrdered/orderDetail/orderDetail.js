// pages/notOrdered/orderDetail/orderDetail.js
Page({
  data: {
    order_type: 1,//1短信订购，2网上订购，3已订购
    array: ['3个月', '6个月', '12个月',],
    index: 1,//下标
    monthNum: 6,//月份
    endTime: '',//结束时间
    studentName: '',//学生姓名
    self: '',//1:自营业务 2:移动业务
    logo: '',// 业务宣传图
    name: '',// 业务名称
    price: '',//订购价格
    desc: '',//业务描述
    businessStatus: '',//1:未开通 2:开通中 3:已开通
    serverBeginTime: '',//业务开通时间
    serverEndTime: '',//业务停止时间
    serviceId: '', //业务id
    serviceType: '', //业务类型
    payMonth: '',//购买月份
    codeValue: ''//短信验证码
  },
  times: function (id) {
    var timestamp = Date.parse(new Date());
    timestamp = timestamp / 1000;
    console.log("当前时间戳为：" + timestamp);
    //加n天的时间戳：  
    var tomorrow_timetamp = timestamp + 24 * 60 * 60 * 30 * id;
    //加n天的时间：  
    var n_to = tomorrow_timetamp * 1000;
    var tomorrow_date = new Date(n_to);
    //加n天后的年份  
    var Y = tomorrow_date.getFullYear();
    //加n天后的月份  
    var M = (tomorrow_date.getMonth() + 1 < 10 ? '0' + (tomorrow_date.getMonth() + 1) : tomorrow_date.getMonth() + 1);
    //加n天后的日期  
    var D = tomorrow_date.getDate() < 10 ? '0' + tomorrow_date.getDate() : tomorrow_date.getDate();
    return (Y + "-" + M + "-" + D);
    //console.log("当前时间：" + Y + "-" + M + "-" + D); 
  },
  formatData: function (data) {
    var timestamp = Date.parse(new Date(data + ''));
    timestamp = timestamp / 1000;
    //加n天的时间戳：  
    var tomorrow_timetamp = timestamp;
    //加n天的时间：  
    var n_to = tomorrow_timetamp * 1000;
    var tomorrow_date = new Date(n_to);
    //加n天后的年份  
    var Y = tomorrow_date.getFullYear();
    //加n天后的月份  
    var M = (tomorrow_date.getMonth() + 1 < 10 ? '0' + (tomorrow_date.getMonth() + 1) : tomorrow_date.getMonth() + 1);
    //加n天后的日期  
    var D = tomorrow_date.getDate() < 10 ? '0' + tomorrow_date.getDate() : tomorrow_date.getDate();
    return (Y + "-" + M + "-" + D);
    //console.log("当前时间：" + Y + "-" + M + "-" + D); 
  },
  bindPickerChange: function (e) {
    var that = this;
    this.setData({
      index: e.detail.value
    });
    if (e.detail.value == 0) {
      this.setData({
        monthNum: 3,
        endTime: that.times(3)
      });
    } else if (e.detail.value == 1) {
      this.setData({
        monthNum: 6,
        endTime: that.times(6)
      });
    } else if (e.detail.value == 2) {
      this.setData({
        monthNum: 12,
        endTime: that.times(12)
      });
    }
  },
  onLoad: function (options) {
    var that = this;
    this.setData({
      endTime: that.times(6)
    });
    //从本地缓存中异步获取指定 key 对应的内容
    wx.getStorage({
      key: 'studentName',
      success: function (res) {
        console.log(res.data)
        that.setData({
          studentName: res.data
        });
      }
    })
    var serviceId = options.serviceid;//业务id
    var self = options.self;// 	1:自营业务 2:移动业务
    this.setData({
      serviceId: serviceId, //业务id
      serviceType: self, //业务类型
    });
    that.detail(serviceId, self);
  },
  /**
     * 查询业务的详情
     */
  detail: function (serviceId, self) {
    var that = this;//12 1网上订购，1 2 短信订购
    var userid = wx.getStorageSync('studentID');//学生ID
    var parentid = wx.getStorageSync('usersid');//当前家长ID1198559
    var token = wx.getStorageSync('token');//token
    var url = getApp().globalData.url; //url+'
    wx.request({
      url: url + 'interface/sProgram/user/selectBusinessInfo.do?serviceId=' + serviceId + '&self=' + self + '&userid=' + userid + '&parentid=' + parentid,
      data: {},
      method: 'GET', // OPTIONS, GET, HEAD, POST, PUT, DELETE, TRACE, CONNECT 
      header: { token: token }, // 设置请求的 header  
      success: function (res) {
        if (res.data.rtnCode == 10000) {
          var serverBeginTime ='';
          if (res.data.rtnData[0].serverBeginTime != null){
            serverBeginTime = that.formatData(res.data.rtnData[0].serverBeginTime.replace(/\-/g, "/"));
          }
          var serverEndTime = '';
          if (res.data.rtnData[0].serverBeginTime != null) {
            serverEndTime = that.formatData(res.data.rtnData[0].serverEndTime.replace(/\-/g, "/"));
          }
          that.setData({
            self: res.data.rtnData[0].self,// 1:自营业务 2:移动业务
            logo: res.data.rtnData[0].logo,// 业务宣传图
            name: res.data.rtnData[0].name,// 业务名称
            price: res.data.rtnData[0].price,//订购价格
            desc: res.data.rtnData[0].desc,//业务描述
            serviceType: res.data.rtnData[0].self,//业务描述
            businessStatus: res.data.rtnData[0].businessStatus,//1:未开通 2:开通中 3:已开通
            serverBeginTime: serverBeginTime,//业务开通时间
            serverEndTime: serverEndTime,//业务停止时间
            payMonth: res.data.rtnData[0].payMonth
          });
        }
      }
    });
  },
  //监听手机号输入
  bindCodeInput: function (e) {
    this.setData({
      codeValue: e.detail.value
    });
  },
  /**
   * 用户订购
   */
  pay_order: function (e) {
    var formData = e.detail.value;
    var that = this;
    //网上订购
    var userid = wx.getStorageSync('studentID');//学生ID
    var parentid = wx.getStorageSync('usersid');//当前家长ID1198559
    var token = wx.getStorageSync('token');//token
    var url = getApp().globalData.url; //url+' 
    if (this.data.serviceType == 1) {
      wx.request({
        url: url + 'interface/parent/user/payMonth.do',
        data: {
          serviceId: that.data.serviceId, //业务id 
          serviceType: that.data.serviceType, //业务类型
          userId: userid, //学生id wx.getStorageSync('studentID')
          parentId: parentid, //家长id wx.getStorageSync('usersid')
          productName: that.data.name, //业务名称
          payType: 1, //支付类型 1按月；2按学期；3按1年　
          payCount: that.data.monthNum, //订购数量
          price: (that.data.monthNum * that.data.price), //订购总价
          cardType: '', //卡类型 1- 借记卡支付 2- 信用卡支付(不传则默认全部)
          terminalId: '12', //设备IMEI
          userUA: '1',//用户UA(浏览器标识)
          payStyle: 3, //1易宝手机支付；3微信支付; 4支付宝支付
          sessionid: wx.getStorageSync('sessionid')

        },
        method: 'POST', // OPTIONS, GET, HEAD, POST, PUT, DELETE, TRACE, CONNECT 
        header: { token: token }, // 设置请求的 header 
        success: function (res) {
          //成功（10000）　失败（10001） 价格变动（10104）
          if (res.data.rtnCode == 10000) {
            wx.requestPayment({
              'timeStamp': res.data.rtnData[0].timestamp,
              'nonceStr': res.data.rtnData[0].noncestr,
              'package': res.data.rtnData[0].prepayid,
              'signType': 'MD5',
              'paySign': res.data.rtnData[0].sign,
              'success': function (res) {
                console.log(res);
                console.log('success');
                //查看订购详情
                that.detail(that.data.serviceId, that.data.serviceType);
                wx.setStorage({ key: "ord", data: 1 })//用户是否订购业务
                //跳转
                // wx.switchTab({
                //   url: '/pages/ordered/notice/notice'
                // })
              },
              'fail': function (res) {
                console.log(res);
                console.log('fail');
              },
              'complete': function (res) {
                console.log(res); console.log('complete');
              }
            });

          } else if (res.data.rtnCode == 10001) {
            //console.log(res.data.result)
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
    //短信订购
    else {
      if (that.data.codeValue == "") {
        wx.showModal({
          title: '提示信息',
          content: "请输入验证码",
          showCancel: false,
          confirmText: "确定",
          success: function (res) {
          }
        });
      } else {
        wx.request({
          url: url + 'interface/parent/user/sendOrd.do',
          data: {
            schoolId: wx.getStorageSync('schoolID'), //学校id
            serviceType: that.data.serviceType, //业务类型（A家园互动；J平安家园）
            userId: parentid, //用户id
            name: wx.getStorageSync('userName'), //用户姓名
            phone: wx.getStorageSync('phone'), //用户电话
            ordCode: that.data.codeValue //验证码（6位）
          },
          method: 'POST', // OPTIONS, GET, HEAD, POST, PUT, DELETE, TRACE, CONNECT 
          header: { token: token }, // 设置请求的 header 
          success: function (res) {
            if (res.data.rtnCode == 10000) {
              wx.showToast({
                title: '订购成功！',
                icon: 'success',
                duration: 2000
              });
              that.detail(that.data.serviceId, that.data.serviceType);
              wx.setStorage({ key: "ord", data: 1 })//用户是否订购业务
              //跳转
              // wx.switchTab({
              //   url: '/pages/ordered/notice/notice'
              // });
            } else if (res.data.rtnCode == 10001) {
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
  }
})