// pages/ordered/flowerRank/flowerRank.js
Page({
  /**
   * 页面的初始数据
   */
  data: {
    winWidth: 0,
    winHeight: 100,
    // tab切换  
    currentTab: 0,
    rewardRank: [],//上个月的前三名（小红花排行信息）
    rank1: {//上月第1名
      name: '',
      photopath: '',
      flowernum: '',
      sort: ''
    },
    rank2: {//上月第2名
      name: '',
      photopath: '',
      flowernum: '',
      sort: ''
    },
    rank3: {//上月第3名
      name: '',
      photopath: '',
      flowernum: '',
      sort: ''
    },
    getReward: '',//是否能够获取奖励（0:否 1:是 2:已领取）
    rtnData: '',// 	本月（小红花排行信息）
    curUserRank: {// 	当前登陆人所属班级班主任红花信息
      name: '',
      photopath: '',
      flowernum: '',
    },
    name: '月',//排行榜名称
    showModalStatus: false,//是否显示弹框
    signFlowerNum: 0,//签到获得的奖励数量
    a:0
  },
  onLoad: function () {
    var that = this;
    that.month();
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
      if (e.target.dataset.current == 1) {
        that.year();
        that.setData({
          name: '年'
        });
      } else {
        that.month();
        that.setData({
          name: '月'
        });
      }
    }
  },
  bindPickerChange: function (e) {
    //console.log('picker发送选择改变，携带值为', e.detail.value)
    this.setData({
      index: e.detail.value
    });
  },
  //月度排行榜
  month: function () {
    wx.showToast({
      title: 'loading...',
      icon: 'loading',
      duration: 200000
    });
    var that = this;
    var token = wx.getStorageSync('token');//token
    var url = getApp().globalData.url; //url+'
    wx.request({
      url: url + 'interface/sProgram/user/monthFlowerRankByStudent.do?schoolId=' + wx.getStorageSync('schoolID') + '&usersid=' + wx.getStorageSync('studentID') + '&eduunitId=' + wx.getStorageSync('unitID'),
      data: {},
      method: 'GET', // OPTIONS, GET, HEAD, POST, PUT, DELETE, TRACE, CONNECT 
      header: { token: token }, // 设置请求的 header  
      success: function (res) {
        //console.log(res.data)
        wx.hideLoading();
        if (res.data.rtnCode == 10000) {
          that.setData({
            rewardRank: res.data.rewardRank,//上个月的前三名（小红花排行信息）
            rank1: res.data.rewardRank[0],
            rank2: res.data.rewardRank[1],
            rank3: res.data.rewardRank[2],
            getReward: res.data.getReward,//是否能够获取奖励（0:否 1:是 2:已领取）
            rtnData: res.data.rtnData,// 	本月（小红花排行信息）
            curUserRank: res.data.curUserRank,// 	当前登陆人所属班级班主任红花信息
          });
        }
      }
    });
  },
  //年度排行榜
  year: function () {
    wx.showToast({
      title: 'loading...',
      icon: 'loading',
      duration: 200000
    });
    var that = this;
    var token = wx.getStorageSync('token');//token
    var url = getApp().globalData.url; //url+'
    wx.request({
      url: url + 'interface/sProgram/user/yearFlowerRankByStudent.do?schoolId=' + wx.getStorageSync('schoolID') + '&usersid=' + wx.getStorageSync('studentID') + '&eduunitId=' + wx.getStorageSync('unitID'),
      data: {},
      method: 'GET', // OPTIONS, GET, HEAD, POST, PUT, DELETE, TRACE, CONNECT 
      header: { token: token }, // 设置请求的 header  
      success: function (res) {
        wx.hideLoading();
        if (res.data.rtnCode == 10000) {
          that.setData({
            rewardRank: res.data.rewardRank,//上个月的前三名（小红花排行信息）
            rank1: res.data.rewardRank[0],
            rank2: res.data.rewardRank[1],
            rank3: res.data.rewardRank[2],

            'rank1.name': res.data.rewardRank[0].name.substring(0, 4),
            'rank1.photopath': res.data.rewardRank[0].photopath,
            'rank2.name': res.data.rewardRank[1].name.substring(0, 4),
            'rank1.photopath': res.data.rewardRank[1].photopath,
            'rank3.name': res.data.rewardRank[2].name.substring(0, 4),
            'rank1.photopath': res.data.rewardRank[2].photopath,


            getReward: res.data.getReward,//是否能够获取奖励（0:否 1:是 2:已领取）
            rtnData: res.data.rtnData,// 	本月（小红花排行信息）
            curUserRank: res.data.curUserRank,// 	当前登陆人所属班级班主任红花信息
          });
        }
      }
    });
  },
  //领取月榜奖励//是否能够获取奖励（0:否 1:是 2:已领取）
  toGetMonthReward: function (e) {
    var that = this;
    var ifreward = e.currentTarget.id
    if (ifreward == 0) {
      // var open = 'open';
      // that.util(open);
      wx.showModal({
        title: '提示信息',
        content: '宝宝不在榜单，不可领取，本月加油哟！',
        showCancel: false,
        confirmText: "确定",
        success: function (res) {
        }
      });
    } else if (ifreward == 1) {
      var that = this;
      var token = wx.getStorageSync('token');//token
      var sort = '';// 	小红花排名
      var usersid = wx.getStorageSync('studentID');
      if (this.data.rank1.usersid == usersid) {
        sort = this.data.rank1.sort;
      } else if (this.data.rank2.usersid == usersid) {
        sort = this.data.rank2.sort;
      } else if (this.data.rank3.usersid == usersid) {
        sort = this.data.rank3.sort;
      }
      var url = getApp().globalData.url; //url+'
      wx.request({
        url: url + 'interface/sProgram/user/recFlowerRewardOfMonth.do?schoolId=' + wx.getStorageSync('schoolID') + '&usersid=' + wx.getStorageSync('studentID') + '&parentId=' + wx.getStorageSync('usersid') + '&rank=' + sort,
        data: {},
        method: 'GET', // OPTIONS, GET, HEAD, POST, PUT, DELETE, TRACE, CONNECT 
        header: { token: token }, // 设置请求的 header  
        success: function (res) {
          if (res.data.rtnCode == 10000) {
            that.setData({
              getReward: 2,//是否能够获取奖励（0:否 1:是 2:已领取）
              signFlowerNum: res.data.rtnData[0]
            });
            var open = 'open';
            that.util(open);
            // wx.showModal({
            //   title: '提示信息',
            //   content: '领取成功，贝豆+' + res.data.rtnData[0],
            //   showCancel: false,
            //   confirmText: "确定",
            //   success: function (res) {
            //   }
            // });
          }
        }
      });
    }
  },
  //领取年榜奖励//是否能够获取奖励（0:否 1:是 2:已领取）
  toGetYearReward: function (e) {
    var that = this;
    var ifreward = e.currentTarget.id
    if (ifreward == 0) {
      // var open = 'open';
      // that.util(open);
      wx.showModal({
        title: '提示信息',
        content: '宝宝不在榜单，不可领取，本年加油哟！',
        showCancel: false,
        confirmText: "确定",
        success: function (res) {
        }
      });
    } else if (ifreward == 1) {
      var that = this;
      var token = wx.getStorageSync('token');//token
      var sort = '';// 	小红花排名
      var usersid = wx.getStorageSync('studentID');
      if (this.data.rank1.usersid == usersid) {
        sort = this.data.rank1.sort;
      } else if (this.data.rank2.usersid == usersid) {
        sort = this.data.rank2.sort;
      } else if (this.data.rank3.usersid == usersid) {
        sort = this.data.rank3.sort;
      }
      var url = getApp().globalData.url; //url+'
      wx.request({
        url: url + 'interface/sProgram/user/recFlowerRewardOfYear.do?schoolId=' + wx.getStorageSync('schoolID') + '&usersid=' + wx.getStorageSync('studentID') + '&parentId=' + wx.getStorageSync('usersid') + '&rank=' + sort,
        data: {},
        method: 'GET', // OPTIONS, GET, HEAD, POST, PUT, DELETE, TRACE, CONNECT 
        header: { token: token }, // 设置请求的 header  
        success: function (res) {
          if (res.data.rtnCode == 10000) {
            that.setData({
              getReward: 2,//是否能够获取奖励（0:否 1:是 2:已领取）
              signFlowerNum: res.data.rtnData[0]
            });
            var open = 'open';
            that.util(open);
          }
        }
      });
    }
  },
  //跳转全园老师月榜
  teacherRank: function (e) {
    var dynamicId = e.currentTarget.id
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
        duration: 3000
      });
      wx.navigateTo({
      url: '/pages/ordered/teacherRank/teacherRank?type=' + this.data.currentTab
    });
    }
  },
  //跳转小红花规则
  flower_rules: function (e) {
    var dynamicId = e.currentTarget.id
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
        duration: 3000
      });
      wx.redirectTo({
      url: '/pages/my/flowerRules/flowerRules'
    });
    }
  },
  powerDrawer: function (e) {
    var currentStatu = e.currentTarget.dataset.statu;
    this.util(currentStatu)
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
    })

    // 第5步：设置定时器到指定时候后，执行第二组动画 
    setTimeout(function () {
      // 执行第二组动画 
      animation.opacity(1).rotateX(0).step();
      // 给数据对象储存的第一组动画，更替为执行完第二组动画的动画对象 
      this.setData({
        animationData: animation
      })

      //关闭 
      if (currentStatu == "close") {
        this.setData(
          {
            showModalStatus: false
          }
        );
      }
    }.bind(this), 200)

    // 显示 
    if (currentStatu == "open") {
      this.setData(
        {
          showModalStatus: true
        }
      );
    }
  }
})