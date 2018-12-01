// pages/ordered/comment/comment.js
Page({
  /**
   * 页面的初始数据
   */
  data: {
    index: '',//被评论index
    comment_type: 0,//类型，0评论动态，1回复评论
    showModalStatus: false,
    dynamicList: [],//详情
    conmment_time: '',//发布时间
    focus: false,//是否获取焦点
    ifAction: true,//是否可以操作
    commonsList: [],//评论列表
    commentNum: '',//评论数量
    flowerNum: '',//小红花数量
    schoolId: '',// 	学校id
    dynamicid: '',//动态id
    publisherid: '',//评论人id
    content: '',//评论内容
    receiverid: '',//接收人id
    level: '',//1对动态的评论；2对评论人的回复
    upcommentid: '',//被评论id(如果是评论的主动态则为0)
    commentcode: '',//被评论编码(如果是评论的主动态则为0)
    dynPublisherid: '',// 	动态发布人id
    dynContent: '',//动态内容
    dynCover: '',//动态封面（动态中第一张图片）
    nickName: '',// 	评论人昵称
    commentaries: 0,//0详情进入，1动态进入
    a: 0//跳转控制
  },
  onLoad: function (options) {
    wx.hideLoading();
    var that = this;
    var commentaries = options.commentaries;//评论
    if (commentaries == 1) {//用户点击评论按钮打开动态详情页面
      that.setData({
        focus: true,//input获取焦点
        commentaries: 1
      });
      // var currentStatu = 'open';
      // that.util(currentStatu)
    } else if (commentaries == 2) {//微信用户通过分享链接打开的动态详情页面
      that.setData({
        ifAction: false//不可操作
      });
    }
    var dynamicid = options.dynamicid;//动态id
    var index = options.index;//被评论index
    var comment_type = options.comment_type;//类型，0评论动态，1回复评论
    var usersid = wx.getStorageSync('usersid');//用户id
    var token = wx.getStorageSync('token');//token
    that.setData({
      dynamicid: dynamicid,
      publisherid: usersid,
      index: index,
      comment_type: comment_type
    });
    //获取动态详情
    var url = getApp().globalData.url; //url+'
    wx.request({
      url: url + 'interface/sProgram/user/getDynamicDetail.do?dynamicId=' + dynamicid + '&userid=' + wx.getStorageSync('usersid'),
      data: {},
      method: 'GET', // OPTIONS, GET, HEAD, POST, PUT, DELETE, TRACE, CONNECT 
      header: { token: token }, // 设置请求的 header  
      success: function (res) {
        if (res.data.rtnCode == 10000) {
          var dynFirstImage = ""; //动态封面（动态中第一张图片）
          if (res.data.rtnData[0].res[0] != null) {
            dynFirstImage = res.data.rtnData[0].res[0].thumbpath;
          }
          that.setData({
            dynamicList: res.data.rtnData,
            commentNum: res.data.rtnData[0].commentNum,//评论数量
            flowerNum: res.data.rtnData[0].flowerNum,//小红花数量
            dynPublisherid: res.data.rtnData[0].senderId,//动态发布人id
            dynContent: res.data.rtnData[0].content,//动态内容
            dynCover: dynFirstImage//res.data.rtnData[0].res[0].thumbpath,//动态封面（动态中第一张图片）
          });
        } else {
        }
      }
    });
    that.selectCommons();
  },
  //时间格式
  transDate: function (sharetime) {
    var tt = new Date(sharetime + '');
    //console.log(sharetime)
    var days = parseInt((new Date().getTime() - new Date(sharetime + '').getTime()) / 86400000);
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
  selectCommons: function () {
    var that = this;
    var token = wx.getStorageSync('token');//token
    //查询动态评论
    var url = getApp().globalData.url; //url+'
    wx.request({
      url: url + 'interface/dynamic/selectCommons.do?dynamicid=' + that.data.dynamicid + '&userId=' + wx.getStorageSync('usersid') + '&page=0&size=30',
      data: {},
      method: 'GET', // OPTIONS, GET, HEAD, POST, PUT, DELETE, TRACE, CONNECT 
      header: { token: token }, // 设置请求的 header  
      success: function (res) {

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
          that.setData({
            commonsList: datas
          });
          // that.setData({
          //   commonsList: res.data.rtnData
          // });
        } else {
        }
      }
    });
  },
  //监听获取焦点
  bingdfocus: function () {
    this.setData({
      focus: true,
      comment_type: 0
    });
  },
  //监听失去焦点
  bingdfocus: function () {
    this.setData({
      focus: true,
    });
  },
  /**
  * 监听输入
  */
  bindInput: function (e) {
    this.setData({
      content: e.detail.value
    });
  },
  //评论或回复
  comment: function () {

  },
  scend: function () {
    if (this.data.comment_type == 0) {//评论
      this.commentaries();
    } else if (this.data.comment_type == 1) {//回复
      this.revert();
    }
  },
  //评论
  commentaries: function () {
    var that = this;
    if (that.data.a == 0) {
      that.setData({
        a: 1
      });
      this.setData({
        focus: false,
      });
      var nick = "";//昵称
      if (wx.getStorageSync('nickName') != null) {
        nick = wx.getStorageSync('nickName');
      }
      var usersid = wx.getStorageSync('usersid');//用户id
      var token = wx.getStorageSync('token');//token
      if (this.data.comment_type == 0) {
        wx.showToast({
          title: '发送中...',
          icon: 'loading',
          duration: 200000
        });
        var url = getApp().globalData.url; //url+'
        wx.request({
          url: url + 'interface/sProgram/user/replyComment.do',
          data: {
            schoolId: wx.getStorageSync('schoolID'),// 	学校id    
            dynamicid: that.data.dynamicList[0].dynamicid,//动态id that.data.dynamicid
            publisherid: wx.getStorageSync('usersid'),//评论人id  
            publicStudentId: wx.getStorageSync('studentID'),//当前学生id
            content: that.data.content,//评论内容 that.data.content
            receiverid: that.data.dynPublisherid,//接收人id
            receiverStudentId: that.data.dynamicList[0].senderRefId,// 	接收人评论时学生id
            level: 1,//1对动态的评论；2对评论人的回复
            eduunitid: wx.getStorageSync('unitID'),//动态所在班级id
            upCommentID: 0,//被评论id(如果是评论的主动态则为0)
            commentCode: '0',//被评论编码(如果是评论的主动态则为0)
            dynPublisherid: that.data.dynPublisherid,// 	动态发布人id
            dynContent: that.data.dynContent,//动态内容
            dynCover: that.data.dynCover,//动态封面（动态中第一张图片）
            pics: [],
            nickName: nick// 	评论人昵称 that.data.nickName
          },
          method: 'POST', // OPTIONS, GET, HEAD, POST, PUT, DELETE, TRACE, CONNECT 
          header: { token: token }, // 设置请求的 header  
          success: function (res) {
            //console.log(res)
            wx.hideLoading();
            if (res.data.rtnCode == 10000) {
              that.setData({
                focus: false,
                content: '',
                a: 0
              });
              //返回跳转
              if (that.data.commentaries == 0) {
                wx.navigateBack({
                  delta: 1
                })
                // wx.redirectTo({
                //   url: '/pages/ordered/dynamicDetails/dynamicDetails?dynamicId=' + that.data.dynamicid + '&commentaries=0'
                // });
              } else {//回动态首页
                wx.redirectTo({
                  url: '/pages/ordered/notice/notice'
                });
              }
            } else {
              //错误提示
              wx.showModal({
                title: '提示信息',
                content: '发送失败，请稍后重试！',
                showCancel: false,
                success: function (res) {
                }
              });
            }
          }
        });
      } else if (this.data.comment_type == 1) {//回复
        that.revert();
      }
    }
  },
  //回复
  revert: function () {
    var that = this;
    if (that.data.a == 0) {
      that.setData({
        a: 1
      });
      var nick = "";//昵称
      if (wx.getStorageSync('nickName') != null) {
        nick = wx.getStorageSync('nickName');
      }
      wx.showToast({
        title: '发送中...',
        icon: 'loading',
        duration: 200000
      });
      var usersid = wx.getStorageSync('usersid');//家长id  1198559
      var token = wx.getStorageSync('token');//token
      var url = getApp().globalData.url; //url+'
      wx.request({
        url: url + 'interface/sProgram/user/replyComment.do',
        data: {
          schoolId: wx.getStorageSync('schoolID'),// 	学校id    
          dynamicid: that.data.dynamicList[0].dynamicid,//动态id that.data.dynamicid
          publisherid: wx.getStorageSync('usersid'),//评论人id  
          publicStudentId: wx.getStorageSync('studentID'),//当前学生id
          content: that.data.content,//评论内容 that.data.content
          receiverid: that.data.commonsList[that.data.index].senderId,//接收人id
          receiverStudentId: that.data.commonsList[that.data.index].senderStudentId,// 	接收人评论时学生id 
          level: 2,//1对动态的评论；2对评论人的回复
          eduunitid: '',//动态所在班级id
          upCommentID: that.data.commonsList[that.data.index].commentid,//被评论id(如果是评论的主动态则为0)
          commentCode: that.data.commonsList[that.data.index].commentCode,//被评论编码(如果是评论的主动态则为0)
          dynPublisherid: that.data.dynPublisherid,// 	动态发布人id
          dynContent: that.data.dynContent,//动态内容
          dynCover: that.data.dynCover,//动态封面（动态中第一张图片）
          pics: [],
          nickName: nick// 	评论人昵称 that.data.nickName
        },
        method: 'POST', // OPTIONS, GET, HEAD, POST, PUT, DELETE, TRACE, CONNECT 
        header: { token: token }, // 设置请求的 header  
        success: function (res) {
          wx.hideLoading();
          if (res.data.rtnCode == 10000) {
            that.setData({
              focus: false,
              content: '',
              a: 0
            });
            //返回跳转
            wx.navigateBack({
              delta: 1
            })
            // wx.redirectTo({
            //   url: '/pages/ordered/dynamicDetails/dynamicDetails?dynamicId=' + that.data.dynamicid + '&commentaries=0'
            // });
          } else {
            //错误提示
            wx.showModal({
              title: '提示信息',
              content: '发送失败，请稍后重试！',
              showCancel: false,
              success: function (res) {
              }
            });
          }
        }
      });
    }
  }
})