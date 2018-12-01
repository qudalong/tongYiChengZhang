// pages/ordered/notice/notice.js
var innerAudioContext = wx.createInnerAudioContext()
Page({
  //页面的初始数据
  data: {
    userid: wx.getStorageSync('usersid'),//用户id
    unitName: wx.getStorageSync('unitName'),//所在班级
    dynamicList: [],//动态内容
    noticeList: [],//短信通知
    dataType: 0,//类型：0动态，1短信
    conmment_time: '',//发布时间
    winWidth: 0,//页面配置 
    winHeight: 100,
    currentTab: 1,// tab切换 
    logo: '',//校园封面图
    curUserRank: {//当前用户信息
      name: '',
      photopath: '',
      sort: '',
      flowernum: ''
    },//当前用户的（小红花排名信息）
    signIn: '',// 	是否签到（0:否 1:是）
    curMonthRank: [],// 	当月前3名（小红花排名信息）
    rank1: {//当月第1名
      name: '',
      photopath: ''
    },
    rank2: {//当月第2名
      name: '',
      photopath: ''
    },
    rank3: {//当月第3名 
      name: '',
      photopath: ''
    },
    page: 1,   // 设置加载的第几次，默认是第一次  
    size: 10,      //返回数据的个数  
    shareId: '',//分享id
    showModalStatus: false,//是否显示弹框
    signFlowerNum: 0,//签到获得的小红花数量
    playingSpeech: '',
    speechIcon: '/image/speech0.png',
    defaultSpeechIcon: '/image/speech0.png',
    a: 0//点击事件控制

  },
  onLoad: function () {
    var that = this;
    //获取系统信息
    wx.getSystemInfo({
      success: function (res) {
        that.setData({
          winWidth: res.windowWidth,
          winHeight: res.windowHeight
        });
      }
    });
    that.dynamic();
    //that.notice();
  },
  //音频播放
  playSpeech: function (event) {
    var that = this;
    var filePath = event.currentTarget.dataset.filepath;
    if (filePath == that.data.playingSpeech) {
      console.log("再次点击关闭播放")
      innerAudioContext.stop();//停止播放
      innerAudioContext.destroy();//关闭前一个播放
        // innerAudioContext.destroy(() => {
        //   console.log('开始播放')
        // });//再次点击关闭播放
      clearInterval(interval);
      that.setData({
        speechIcon: '/image/speech0.png',
        playingSpeech: ''
      });
    } else {
      innerAudioContext.destroy;//关闭前一个播放
      innerAudioContext = wx.createInnerAudioContext()
      that.setData({
        playingSpeech: filePath
      });
      var num = 1;
      var interval = setInterval(function () {
        that.setData({
          speechIcon: '/image/speech' + num % 3 + '.png'
        });
        num++;
      }, 500);
      console.log(filePath);
      innerAudioContext.autoplay = true
      innerAudioContext.src = filePath
      innerAudioContext.onPlay(() => {
        console.log('开始播放')
      })
      innerAudioContext.onError((res) => {
        console.log(res.errMsg)
        console.log(res.errCode)
      })  
    }
  },
  //下拉刷新
  onPullDownRefresh: function () {
    wx.showToast({
      title: 'loading...',
      icon: 'loading'
    });
    this.dynamic();
    //console.log('onPullDownRefresh', new Date())
  },
  //下一页
  onReachBottom: function () {
    wx.hideLoading();
    // Do something when page reach bottom.
    wx.showToast({
      title: 'loading...',
      icon: 'loading'
    });
    if (this.data.dataType == 0) {
      this.nextDynamic();
    } else {
      this.notice();
    }
    //console.log('circle 下一页');
  },
  //点击tab切换
  swichNav: function (e) {
    var that = this;
    if (this.data.currentTab === e.target.dataset.current) {
      return false;
    } else {
      that.setData({
        currentTab: e.target.dataset.current
      });
      //console.log(e.target.dataset.current)
      if (e.target.dataset.current == 1) {
        that.dynamic();
      } else {
        that.setData({
          page: 0  // 设置加载的第几次，默认是第一次  
        });
        that.notice();
      }
    }
  },
  //时间格式
  transDate: function (sharetime) {
    var tt = new Date(sharetime.replace(/\-/g, "/") + '');
    //console.log(sharetime)
    var days = parseInt((new Date().getTime() - new Date(sharetime.replace(/\-/g, "/") + '').getTime()) / 86400000);
    var today = new Date().getDate();
    var year = tt.getFullYear();
    var nowYear = new Date().getFullYear();
    var mouth = tt.getMonth() + 1;
    var day = tt.getDate();
    var time = tt.getHours() < 10 ? "0" + tt.getHours() : tt.getHours();
    var min = tt.getMinutes() < 10 ? "0" + tt.getMinutes() : tt.getMinutes();
    var result, offset;
    offset = Math.abs(today - day);
    if (days < 4 && offset < 3) {
      if (offset === 0) {
        result = "今天" + time + ":" + min;
      } else if (offset === 1) {
        result = "昨天" + time + ":" + min;
      } else if (offset === 2) {
        result = "前天" + time + ":" + min;
      }
    } else if (nowYear == year) {
      result = mouth + "-" + day + " " + time + ":" + min;
    } else {
      result = year + "-" + mouth + "-" + day + " " + time + ":" + min;
    }
    //console.log(result)
    this.setData({
      conmment_time: result
    });
  },
  //校园动态首页
  dynamic: function () {
    wx.showToast({
      title: 'loading...',
      icon: 'loading',
      duration: 200000
    });
    var that = this;
    that.setData({
      dataType: 0, //类型：0动态，1短信
      page: 1
    });
    var token = wx.getStorageSync('token');//token
    var url = getApp().globalData.url; //url+
    wx.request({
      url: url + 'interface/sProgram/user/index.do',
      data: {
        schoolId: wx.getStorageSync('schoolID'),//学校id
        usersid: wx.getStorageSync('studentID'),//用户id   
        eduunitId: wx.getStorageSync('unitID'),//班级ID
        size: that.data.size //第一页动态数量（不加载传0）
      },
      method: 'POST', // OPTIONS, GET, HEAD, POST, PUT, DELETE, TRACE, CONNECT 
      header: { token: token }, // 设置请求的 header  
      success: function (res) {
        console.log(res)
        wx.hideLoading();
        wx.stopPullDownRefresh();
        if (res.data.rtnCode == 10000) {
          that.setData({
            logo: res.data.logo,//校园封面图
            curUserRank: res.data.curUserRank,//当前用户的（小红花排名信息）
            signIn: res.data.signIn,// 	是否签到（0:否 1:是）
            curMonthRank: res.data.curMonthRank,// 	当月前3名（小红花排名信息）
            'rank1.name': res.data.curMonthRank[0].name.substring(0, 4),
            'rank1.photopath': res.data.curMonthRank[0].photopath,
            'rank2.name': res.data.curMonthRank[1].name.substring(0, 4),
            'rank1.photopath': res.data.curMonthRank[1].photopath,
            'rank3.name': res.data.curMonthRank[2].name.substring(0, 4),
            'rank1.photopath': res.data.curMonthRank[2].photopath,
            //dynamicList: res.data.rtnData,
            noticeList: ''
          });
          var datas = res.data.rtnData;
          for (var i = 0; i < datas.length; i++) {
            // 时间戳装换  
            //目的是转换格式
            //设置setData 中的 conmment_time
            that.transDate(datas[i].stime);
            //通过that 拿到 conmment_time的值值for循环出来
            datas[i].stime = that.data.conmment_time
            // console.log("ee"+ datas[i].createDate);
          }
          //然后 改好时间格式 遍历出来就好
          that.setData({
            dynamicList: datas
          });
        }
      }
    });
  },
  //查询校园动态（分页）
  nextDynamic: function () {
    var that = this;
    that.setData({
      dataType: 0 //类型：0动态，1短信
    });
    var schoolID = wx.getStorageSync('schoolID');//学校id  
    var usersid = wx.getStorageSync('usersid');//用户id
    var unitID = wx.getStorageSync('unitID');//班级id
    var token = wx.getStorageSync('token');//token
    var url = getApp().globalData.url; //url+
    wx.request({
      url: url + 'interface/sProgram/user/selectDynamicInfo.do?schoolId=' + wx.getStorageSync('schoolID') + '&eduunitid=' + wx.getStorageSync('unitID') + '&userid=' + wx.getStorageSync('usersid') + '&page=' + that.data.page + '&size=' + that.data.size,
      //data: formData,
      data: {},
      method: 'POST', // OPTIONS, GET, HEAD, POST, PUT, DELETE, TRACE, CONNECT 
      header: { token: token }, // 设置请求的 header  
      success: function (res) {
        //console.log(res.data)
        wx.hideLoading();
        if (res.data.rtnCode == 10000) {
          if (res.data.rtnData.length > 0) {
            that.setData({
              page: that.data.page + 1
            });
          }
          var datas = res.data.rtnData;
          for (var i = 0; i < datas.length; i++) {
            // 时间戳装换  
            //目的是转换格式
            //设置setData 中的 conmment_time
            that.transDate(datas[i].stime);
            //通过that 拿到 conmment_time的值值for循环出来
            datas[i].stime = that.data.conmment_time
            // console.log("ee"+ datas[i].createDate);
          }
          //然后 改好时间格式 遍历出来就好
          that.setData({
            dynamicList: that.data.dynamicList.concat(datas),
            noticeList: ''
          });
        }
      }
    });
  },
  //查询我能接收的短信通知
  notice: function () {
    wx.showToast({
      title: 'loading...',
      icon: 'loading',
      duration: 200000
    });
    var that = this;
    that.setData({
      dataType: 1 //类型：0动态，1短信
    });
    var schoolID = wx.getStorageSync('schoolID');//学校id
    var studentid = wx.getStorageSync('studentID');//学生ID
    var unitID = wx.getStorageSync('unitID');//班级id
    var token = wx.getStorageSync('token');//token
    var url = getApp().globalData.url; //url+'
    wx.request({
      url: url + 'interface/sProgram/user/selectReceiveSmsNotice.do?schoolId=' + wx.getStorageSync('schoolID') + '&eduunitids=' + wx.getStorageSync('unitID') + '&userid=' + wx.getStorageSync('studentID') + '&page=' + that.data.page + '&size=' + that.data.size,
      data: {},
      method: 'GET', // OPTIONS, GET, HEAD, POST, PUT, DELETE, TRACE, CONNECT 
      header: { token: token }, // 设置请求的 header  
      success: function (res) {
        //console.log(res.data)
        wx.hideLoading();
        if (res.data.rtnCode == 10000) {
          var datas = res.data.rtnData;
          for (var i = 0; i < datas.length; i++) {
            // 时间戳装换  
            //目的是转换格式
            //设置setData 中的 conmment_time
            that.transDate(datas[i].stime);
            //通过that 拿到 conmment_time的值值for循环出来
            datas[i].stime = that.data.conmment_time
            // console.log("ee"+ datas[i].createDate);
          }
          //然后 改好时间格式 遍历出来就好
          if (that.data.page == 0) {
            that.setData({
              noticeList: datas,
              dynamicList: ''
            });
          } else {
            that.setData({
              noticeList: that.data.noticeList.concat(datas),
              dynamicList: ''
            });
          }
          if (res.data.rtnData.length > 0) {
            that.setData({
              page: that.data.page + 1
            });
          }
        }
      }
    });
  },
  //用户签到
  sign: function (e) {
    //签到并返回小红花结果
    wx.showToast({
      title: 'loading...',
      icon: 'loading',
      duration: 200000
    });
    var that = this;
    var token = wx.getStorageSync('token');//token
    var url = getApp().globalData.url; //url+'
    wx.request({
      url: url + 'interface/sProgram/user/insertSignFlowerpersonal.do?eduunitid=' + wx.getStorageSync('unitID') + '&studentId=' + wx.getStorageSync('studentID') + '&schoolid=' + wx.getStorageSync('schoolID'),
      data: {},
      method: 'GET', // OPTIONS, GET, HEAD, POST, PUT, DELETE, TRACE, CONNECT 
      header: { token: token }, // 设置请求的 header  
      success: function (res) {
        //console.log(res.data)
        wx.hideLoading();
        if (res.data.rtnCode == 10000) {
          that.setData({
            'curUserRank.flowernum': res.data.flowernum,//当前用户的（小红花排名信息）
            'curUserRank.sort': res.data.sort,
            signIn: 1,// 	是否签到（0:否 1:是）
            signFlowerNum: res.data.total
          });
          var open = 'open';
          that.util(open);
        }
        // wx.showToast({
        //   title: '签到成功+' + res.data.total,
        //   icon: 'success',
        //   duration: 2000
        // });
      }
    });
  },
  send_flowers: function (e) {
    var i = e.currentTarget.id
    //赠送动态小红花
    wx.showToast({
      title: 'loading...',
      icon: 'loading',
      duration: 200000
    });
    var that = this;
    var dynFirstImage = ""; //动态封面（动态中第一张图片）
    if (that.data.dynamicList[i].res != null) {
      dynFirstImage = that.data.dynamicList[i].res[0].thumbpath;
    }
    var token = wx.getStorageSync('token');//token
    var url = getApp().globalData.url; //url+'
    wx.request({
      url: url + 'interface/sProgram/user/insertFlowerdynamic.do',
      data: {
        dynamicid: that.data.dynamicList[i].dynamicid,//动态ID
        usersid: wx.getStorageSync('usersid'),//	家长id
        studentId: that.data.dynamicList[i].senderRefId,//动态发布人学生ID
        usertype: 3,//用户类型 3
        receiverid: that.data.dynamicList[i].senderId,//动态发布人ID
        dynContent: that.data.dynamicList[i].content,//动态内容
        dynCover: dynFirstImage//that.data.dynamicList[i].res[0].thumbpath,//动态封面（动态中第一张图片）
      },
      method: 'POST', // OPTIONS, GET, HEAD, POST, PUT, DELETE, TRACE, CONNECT 
      header: { token: token }, // 设置请求的 header  
      success: function (res) {
        //console.log(res.data)
        wx.hideLoading();
        if (res.data.rtnCode == 10000) {
          var param = {};
          var string = "dynamicList[" + i + "].send";
          param[string] = '1';
          that.setData(param);
          //console.log(that.data.dynamicList[i].content)
          wx.showToast({
            title: '送花成功+' + 1,
            icon: 'success',
            duration: 2000
          });
        } else {
          wx.showModal({
            title: '提示信息',
            content: res.data.result,
            showCancel: false,
            success: function (res) {
            }
          })
        }
      }
    });
  },
  flowerContributionRank: function (e) {
    var dynamicid = e.currentTarget.id;
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
      url: '/pages/ordered/flowerContributionRank/flowerContributionRank?dynamicid=' + dynamicid
    });
    }
  },
  //直接进入详情
  detail_page: function (e) {
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
    var dynamicId = e.currentTarget.id;
    wx.navigateTo({
      url: '/pages/ordered/dynamicDetails/dynamicDetails?dynamicId=' + dynamicId + '&commentaries=0'
    });
    }
  },
  //点击评论进入详情-跳转页面去评论动态
  detail_page2: function (e) {
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
    var dynamicId = e.currentTarget.id;
    wx.navigateTo({
      url: '/pages/ordered/comment/comment?dynamicid=' + dynamicId + '&index=0&comment_type=0&commentaries=1'
    });
    }
  },
  //跳转红花榜
  flowerRank: function (e) {
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
    var dynamicId = e.currentTarget.id;
    wx.navigateTo({
      url: '/pages/ordered/flowerRank/flowerRank'
    });
    }
  },
  //更多
  select_more: function (e) {
    var that = this;
    var i = e.currentTarget.id;
    wx.showActionSheet({
      itemList: ['删除'],
      success: function (e) {
        //console.log(e.tapIndex)
        if (e.tapIndex == 0) {
          //删除
          wx.showModal({
            title: '提示信息',
            content: '是否确认删除！',
            showCancel: true,
            success: function (res) {
              if (res.confirm) {
                var usersid = wx.getStorageSync('usersid');//家长id  1198559
                var token = wx.getStorageSync('token');//token
                var url = getApp().globalData.url; //url+'
                wx.showToast({
                  title: 'loading...',
                  icon: 'loading',
                  duration: 200000
                });
                wx.request({
                  url: url + 'interface/sProgram/user/deleteDynamic.do',
                  data: {
                    dynamicid: that.data.dynamicList[i].dynamicid,//动态ID
                    schoolid: wx.getStorageSync('schoolID'),//学校id  
                    type: that.data.dynamicList[i].type,//
                    userid: that.data.dynamicList[i].senderId,//用户id,
                    eduunitid: wx.getStorageSync('unitID'),//班级id  
                    studentId: that.data.dynamicList[i].senderRefId// 	学生id
                  },
                  method: 'POST', // OPTIONS, GET, HEAD, POST, PUT, DELETE, TRACE, CONNECT 
                  header: { token: token }, // 设置请求的 header  
                  success: function (res) {
                    wx.hideLoading();
                    if (res.data.rtnCode == 10000) {
                      var param = {};
                      var string = "dynamicList[" + i + "]";
                      param[string] = '';
                      that.setData(param);
                      wx.showToast({
                        title: '删除成功！',
                        icon: 'success',
                        duration: 2000
                      });
                    }
                  }
                });
              } else if (res.cancel) {
              }
            }
          });
        }
      }
    });
  },
  //分享
  onShareAppMessage: function (res) {
    var that = this;
    if (res.from === 'button') {
      // 来自页面内转发按钮
      //console.log(res.target);
    }
    return {
      title: '班级动态分享',
      path: '/pages/ordered/dynamicDetails/dynamicDetails?dynamicId=' + that.data.shareId + '&commentaries=2',
      success: function (res) {
        // 转发成功
      },
      fail: function (res) {
        // 转发失败
      }
    }
  },
  //跳转首页
  center: function () {
    // wx.showToast({
    //   title: 'loading...',
    //   icon: 'loading'
    // });
    // wx.navigateTo({
    //   url: '/pages/ordered/notice/notice'
    // });
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
    wx.navigateTo({
      url: '/pages/ordered/publish/publish'
    });
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
