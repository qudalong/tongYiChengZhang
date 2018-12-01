// pages/my/index/index.js
Page({

  /**
   * 页面的初始数据
   */
  data: {
    userid: wx.getStorageSync('usersid'),//当前用户id
    studentID: wx.getStorageSync('studentID'),//学生id
    flowerNum: '',//小红花数量
    walletNum: '',//贝豆数量
    nickName: '',//微信昵称
    avatarUrl: '',////微信头像
    parent_image: '',//宝宝家长头像
    studentName: '',//宝宝姓名
    selectStudents: '0',//是否有可选择的孩子
    studentList: [],//可选择的孩子
    showModalStatus: false,
    index: '',//数组下标
    a: 0 //点击事件控制
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.getInfo();
    var that = this;
    wx.getUserInfo({
      success: function (res) {
        that.setData({
          nickName: res.userInfo.nickName,
          avatarUrl: res.userInfo.avatarUrl
        });
      },
    });
    that.setData({
      studentName: wx.getStorageSync('studentName').substring(0, 5),//宝宝姓名
      parent_image: wx.getStorageSync('photopath'),//宝宝家长头像
      studentID: wx.getStorageSync('studentID')//学生id
    });
  },
  getInfo: function () {
    var that = this;
    var token = wx.getStorageSync('token');//token
    var url = getApp().globalData.url; //url+'
    //查询可选择的孩子
    wx.request({
      url: url + 'interface/sProgram/user/selectStudents.do?parentId=' + wx.getStorageSync('usersid'),
      data: {},
      method: 'GET', // OPTIONS, GET, HEAD, POST, PUT, DELETE, TRACE, CONNECT 
      header: { token: token }, // 设置请求的 header  
      success: function (res) {
        if (res.data.rtnCode == 10000) {
          that.setData({
            selectStudents: 1,
            studentList: res.data.rtnData
          });
        }
      }
    });

    //根据用户id获取贝豆数和小红花数
    wx.request({
      url: url + 'interface/sProgram/user/getUsersBeanCountAndFlower.do?studentId=' + wx.getStorageSync('studentID') + '&parentId=' + wx.getStorageSync('usersid') + '&type=2',
      data: {},
      method: 'GET', // OPTIONS, GET, HEAD, POST, PUT, DELETE, TRACE, CONNECT 
      header: { token: token }, // 设置请求的 header  
      success: function (res) {
        if (res.data.rtnCode == 10000) {
          that.setData({
            walletNum: res.data.rtnData[0],
            flowerNum: res.data.rtnData[1]
          });
        }
      }
    });

  },
  //解除绑定关系
  canceBingDing: function () {
    wx.showModal({
      title: '提示信息',
      content: '是否确认解除绑定！',
      showCancel: true,
      success: function (res) {
        if (res.confirm) {
          var token = wx.getStorageSync('token');//token
          var url = getApp().globalData.url; //url+'
          wx.request({
            url: url + 'interface/sProgram/user/cancelWeiXinBinding.do',
            data: {
              phone: wx.getStorageSync('phone'),
              sessionid: wx.getStorageSync('sessionid')
            },
            method: 'GET', // OPTIONS, GET, HEAD, POST, PUT, DELETE, TRACE, CONNECT 
            header: { token: token }, // 设置请求的 header  
            success: function (res) {
              if (res.data.rtnCode == 10000) {
                wx.showToast({
                  title: '解除成功！',
                  icon: 'success',
                  duration: 2000
                })
              } else {
                wx.showModal({
                  title: '提示信息',
                  content: res.data.result,
                  showCancel: false,
                  success: function (res) {
                    if (res.confirm) {
                    }
                  }
                });
              }
            }
          });
        } else if (res.cancel) {
        }
      }
    });
  },
  /**
   * 可选择的孩子
   */
  radioChange: function (e) {
    // console.log('radio发生change事件，携带value值为：', e.detail.value)
    this.setData({
      index: e.detail.value
    });
  },
  //进行切换
  changeStudents: function () {
    var that = this;
    var switchs = 0;
    console.log(this.data.index)
    if (this.data.index != '') {
      wx.showToast({
        title: 'loading...',
        icon: 'loading',
        duration: 200000
      });
      var token = wx.getStorageSync('token');//token
      if (this.data.studentList[this.data.index].studentID != that.data.studentID) {
        switchs = 1;
      }
      var url = getApp().globalData.url; //url+'
      wx.request({
        url: url + 'interface/sProgram/user/selectStudent.do',
        data: {
          userid: this.data.studentList[this.data.index].studentID,//学生id
          parentId: that.data.userid,//家长id
          username: that.data.nickName,//家长姓名
          imsi: '12',//设备编号
          switchStudent: switchs,// 	是否切换学生操作（0:否 1:是）
        },
        method: 'GET', // OPTIONS, GET, HEAD, POST, PUT, DELETE, TRACE, CONNECT 
        header: { token: token }, // 设置请求的 header  
        success: function (res) {
          wx.hideLoading();
          if (res.data.rtnCode == 10000) {
            wx.showToast({
              title: '设置成功！',
              icon: 'success',
              duration: 2000
            });
            that.setData({
              studentName: res.data.rtnData[0].studentName.substring(0, 5),//宝宝姓名
              studentID: res.data.rtnData[0].studentID//学生id
            });
            wx.setStorage({ key: "token", data: res.data.token })
            wx.setStorage({ key: "schoolID", data: res.data.rtnData[0].schoolID })//学校ID 3
            wx.setStorage({ key: "unitID", data: res.data.rtnData[0].unitID })//班级ID 
            wx.setStorage({ key: "unitName", data: res.data.rtnData[0].unitName })//班级名称
            wx.setStorage({ key: "studentID", data: res.data.rtnData[0].studentID })//学生ID 787 
            wx.setStorage({ key: "studentName", data: res.data.rtnData[0].studentName })//学生姓名
            that.getInfo();
          }
        }
      });
    }
  },
  //我的钱包
  wallet: function () {
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
        url: '/pages/my/wallet/wallet'
      });
    }
  },
  //小红花明细
  flower: function () {
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
        url: '/pages/my/flower/flower'
      });
    }
  },
  //宝宝动态
  babyDybnamic: function () {
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
        url: '/pages/my/dynamics/dynamics'
      });
    }
  },
  //跳转考勤
  babyAttend: function () {
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
        url: '/pages/my/attendance/attendance'
      });
    }
  },
  //跳转业务订购
  orderBusiness: function () {
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
  //跳转商城
  shopping: function () {
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
        url: '/pages/my/shopping/shopping'
      });
    }
  },

  //跳转微信服务
  weixinService: function () {
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
        url: '/pages/my/weixinService/weixinService'
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
    // wx.navigateTo({
    //   url: '/pages/my/index/index'
    // });
  },
  powerDrawer: function (e) {
    var currentStatu = e.currentTarget.dataset.statu;
    if (currentStatu == 'close') {
      this.changeStudents();
    }
    this.util(currentStatu);
  },
  util: function (currentStatu) {
    /* 动画部分 */
    // 第1步：创建动画实例 
    var animation = wx.createAnimation({
      duration: 200, //动画时长 
      timingFunction: "linear", //线性 
      delay: 0 //0则不延迟 
    });

    // 第2步：这个动画实例赋给当前的动画实例 
    this.animation = animation;

    // 第3步：执行第一组动画 
    animation.opacity(0).rotateX(-100).step();

    // 第4步：导出动画对象赋给数据对象储存 
    this.setData({
      animationData: animation.export()
    });

    // 第5步：设置定时器到指定时候后，执行第二组动画 
    setTimeout(function () {
      // 执行第二组动画 
      animation.opacity(1).rotateX(0).step();
      // 给数据对象储存的第一组动画，更替为执行完第二组动画的动画对象 
      this.setData({
        animationData: animation
      });
      //关闭 
      if (currentStatu == "close") {
        this.setData({
          showModalStatus: false
        });
      }
    }.bind(this), 200)
    // 显示 
    if (currentStatu == "open") {
      this.setData({
        showModalStatus: true
      });
    }
  }
})