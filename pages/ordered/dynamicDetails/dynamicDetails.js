// pages/ordered/dynamicDetails/dynamicDetails.js
Page({
  /**
   * 页面的初始数据
   */
  data: {
    userid: '',//当前用户id
    index: '',//被评论index
    comment_type: 0,//类型，0评论动态，1回复评论
    showModalStatus: false,
    dynamicList: [],//详情
    stime: '',//动态发布时间
    conmment_time: '',//评论发布时间
    focus: false,//是否获取焦点
    ifAction: true,//是否可以操作
    commonsList: [],//评论列表
    commentNum: '',//评论数量
    flowerNum: '',//小红花数量
    send:'',//是否送花
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
    array: [],// 需要预览的图片http链接列表 
    page: 0,   // 设置加载的第几次，默认是第一次  
    size: 10,      //返回数据的个数 
    a: 0//点击事件控制
  },
  onLoad: function (options) {
    wx.hideLoading();
    var that = this;
    var commentaries = options.commentaries;//评论
    if (commentaries == 1) {//用户点击评论按钮打开动态详情页面
      that.setData({
        focus: true//input获取焦点
      });
      // var currentStatu = 'open';
      // that.util(currentStatu)
    } else if (commentaries == 2) {//微信用户通过分享链接打开的动态详情页面
      that.setData({
        ifAction: false//不可操作
      });
    }
    var dynamicId = options.dynamicId;//动态id
    var usersid = wx.getStorageSync('usersid');//用户id
    var token = wx.getStorageSync('token');//token
    that.setData({
      dynamicid: dynamicId,
      publisherid: usersid,
      userid: usersid
    });
    //获取动态详情
    that.getInfo();
    //that.selectCommons();
  },
  /**
  * 生命周期函数--监听页面显示
  */
  onShow: function () {
    this.setData({
      page: 0,
      commonsList:[]
    });
    this.selectCommons();
  },
  //获取动态详情
  getInfo: function () {
    var that = this;
    var token = wx.getStorageSync('token');//token
    var url = getApp().globalData.url; //url+'
    wx.request({
      url: url + 'interface/sProgram/user/getDynamicDetail.do?dynamicId=' + that.data.dynamicid + '&userid=' + wx.getStorageSync('usersid'),
      data: {},
      method: 'GET', // OPTIONS, GET, HEAD, POST, PUT, DELETE, TRACE, CONNECT 
      header: { token: token }, // 设置请求的 header  
      success: function (res) {
        console.log(res)
        if (res.data.rtnCode == 10000) {
          var dynFirstImage = ""; //动态封面（动态中第一张图片）
          if (res.data.rtnData[0].res[0] != null) {
            dynFirstImage = res.data.rtnData[0].res[0].thumbpath;
          }
          that.transDate(res.data.rtnData[0].stime);
          //通过that 拿到 conmment_time的值值for循环出来
          that.setData({
            stime: that.data.conmment_time,
            dynamicList: res.data.rtnData,
            commentNum: res.data.rtnData[0].commentNum,//评论数量
            flowerNum: res.data.rtnData[0].flowerNum,//小红花数量
            send: res.data.rtnData[0].send,//是否送花
            dynPublisherid: res.data.rtnData[0].senderId,//动态发布人id
            dynContent: res.data.rtnData[0].content,//动态内容
            dynCover: dynFirstImage//res.data.rtnData[0].res[0].thumbpath,//动态封面（动态中第一张图片）
          });
          for (var i = 0; i < res.data.rtnData[0].res.length; i++) {
            that.setData({
              array: that.data.array.concat(res.data.rtnData[0].res[i].thumbpath)
            });
          }

        } else {
        }
      }
    });

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
  //下一页
  onReachBottom: function () {
    wx.hideLoading();
    wx.showToast({
      title: 'loading...',
      icon: 'loading'
    });
    this.selectCommons();
  },
  selectCommons: function () {
    var that = this;
    var token = wx.getStorageSync('token');//token
    //查询动态评论
    var url = getApp().globalData.url; //url+'
    wx.request({
      url: url + 'interface/dynamic/selectCommons.do?dynamicid=' + that.data.dynamicid + '&userId=' + wx.getStorageSync('usersid') + '&page=' + that.data.page + '&size=' + that.data.size,
      data: {},
      method: 'GET', // OPTIONS, GET, HEAD, POST, PUT, DELETE, TRACE, CONNECT 
      header: { token: token }, // 设置请求的 header  
      success: function (res) {
        wx.hideLoading();
        if (res.data.rtnCode == 10000) {
          console.log(res)
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
            commonsList: that.data.commonsList.concat(datas)
          });
          if (res.data.rtnData.length > 0) {
            that.setData({
              page: that.data.page + 1
            });
          }
        } else {
        }
      }
    });
  },
  flowerContributionRank: function (e) {
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
      if (this.data.ifAction == true) {
        var dynamicid = e.currentTarget.id
        wx.navigateTo({
          url: '/pages/ordered/flowerContributionRank/flowerContributionRank?dynamicid=' + dynamicid
        });
      }
    }
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
  //预览图片
  previewImage: function (e) {
    var current = e.target.dataset.src;
    wx.previewImage({
      current: current, // 当前显示图片的http链接  
      urls: this.data.array // 需要预览的图片http链接列表  
    })
  },
  //跳转页面去评论动态
  comment: function () {
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
        url: '/pages/ordered/comment/comment?dynamicid=' + that.data.dynamicid + '&index=' + that.data.index + '&comment_type=0'
      });
    }
  },
  //跳转页面去回复评论
  revert: function () {
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
        url: '/pages/ordered/comment/comment?dynamicid=' + that.data.dynamicid + '&index=' + that.data.index + '&comment_type=1'
      });
    }
  },
  //评论
  commentaries: function (e) {
    this.setData({
      focus: false
    });
    var currentStatu = e.currentTarget.dataset.statu;
    this.util(currentStatu)
    var that = this;
    var nick = "";//昵称
    if (wx.getStorageSync('nickName') != null) {
      nick = wx.getStorageSync('nickName');
    }
    var usersid = wx.getStorageSync('usersid');//用户id
    var token = wx.getStorageSync('token');//token
    if (this.data.comment_type == 0) {
      this.comment();


      // var url = getApp().globalData.url; //url+'
      // wx.request({
      //   url: url + 'interface/sProgram/user/replyComment.do',
      //   data: {
      //     schoolId: wx.getStorageSync('schoolID'),// 	学校id    
      //     dynamicid: that.data.dynamicList[0].dynamicid,//动态id that.data.dynamicid
      //     publisherid: wx.getStorageSync('usersid'),//评论人id  
      //     publicStudentId: wx.getStorageSync('studentID'),//当前学生id
      //     content: that.data.content,//评论内容 that.data.content
      //     receiverid: that.data.dynPublisherid,//接收人id
      //     receiverStudentId: 787,// 	接收人评论时学生id
      //     level: 1,//1对动态的评论；2对评论人的回复
      //     eduunitid: wx.getStorageSync('unitID'),//动态所在班级id
      //     upCommentID: 0,//被评论id(如果是评论的主动态则为0)
      //     commentCode: '0',//被评论编码(如果是评论的主动态则为0)
      //     dynPublisherid: that.data.dynPublisherid,// 	动态发布人id
      //     dynContent: that.data.dynContent,//动态内容
      //     dynCover: that.data.dynCover,//动态封面（动态中第一张图片）
      //     pics: [],
      //     nickName: nick// 	评论人昵称 that.data.nickName
      //   },
      //   method: 'POST', // OPTIONS, GET, HEAD, POST, PUT, DELETE, TRACE, CONNECT 
      //   header: { token: token }, // 设置请求的 header  
      //   success: function (res) {
      //     console.log(res)
      //     if (res.data.rtnCode == 10000) {
      //       that.setData({
      //         focus: false,
      //         content: ''
      //       });
      //       that.selectCommons();
      //     } else {
      //     }
      //   }
      // });



    } else if (this.data.comment_type == 1) {//回复
      that.revert();
    }
  },
  enjoyed: function (e) {
    if (this.data.ifAction == true) {
      var i = e.currentTarget.id
      //动态评论点赞
      wx.showToast({
        title: 'loading...',
        icon: 'loading',
        duration: 200000
      });
      var that = this;
      var usersid = wx.getStorageSync('usersid');//家长id  1198559
      var token = wx.getStorageSync('token');//token
      var url = getApp().globalData.url; //url+'
      wx.request({
        url: url + 'interface/sProgram/user/commentEnjoy.do',
        data: {
          pvid: that.data.commonsList[i].commentid,//动态评论id
          usersid: wx.getStorageSync('usersid'),// 	点赞人id
          usertype: 3,// 	点赞人用户类型
          nickName: wx.getStorageSync('userName'),// 	点赞人名称
          dynId: that.data.dynamicList[0].dynamicid,//动态id
          dynPublisherid: that.data.dynamicList[0].senderId,// 	动态发布人id
          dynContent: that.data.dynamicList[0].content,//动态内容
          dynCover: that.data.dynCover,//动态封面（动态中第一张图片）that.data.dynamicList[i].res[0].thumbpath
          receiverid: that.data.commonsList[i].senderId,// 	动态评论发布人id
          receiverstudentid: that.data.commonsList[i].senderStudentId,//动态评论发布人学生id
        },
        method: 'POST', // OPTIONS, GET, HEAD, POST, PUT, DELETE, TRACE, CONNECT 
        header: { token: token }, // 设置请求的 header  
        success: function (res) {
          wx.hideLoading();
          if (res.data.rtnCode == 10000) {
            var param = {};
            var string = "commonsList[" + i + "].enjoyed";
            param[string] = '1';
            that.setData(param);
            var param2 = {};
            var string = "commonsList[" + i + "].enjoyedNum";
            param2[string] = that.data.commonsList[i].enjoyedNum + 1;
            that.setData(param2);
            //console.log(that.data.commonsList[i].content)
            wx.showToast({
              title: '点赞成功+' + 1,
              icon: 'success',
              duration: 2000
            });
          }
        }
      });
    }
  },
  //回复
  revert2: function () {
    var that = this;
    var nick = "";//昵称
    if (wx.getStorageSync('nickName') != null) {
      nick = wx.getStorageSync('nickName');
    }
    var usersid = wx.getStorageSync('usersid');//家长id  1198559
    var token = wx.getStorageSync('token');//token
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
        if (res.data.rtnCode == 10000) {
          that.setData({
            focus: false,
            content: ''
          });
          that.selectCommons();
        } else {
        }
      }
    });
  },
  //更多
  select_more: function (e) {
    if (this.data.ifAction == true) {
      var id = e.currentTarget.id;////被评论下标
      // console.log('被评论下标' + id)
      var that = this;
      var usersid = wx.getStorageSync('usersid');//家长id  1198559
      var token = wx.getStorageSync('token');//token
      var itemList1 = ['回复'];
      if (that.data.userid == that.data.commonsList[id].senderId) {
        itemList1 = ['回复', '删除'];
      }
      wx.showActionSheet({
        itemList: itemList1,
        success: function (e) {
          //console.log(e.tapIndex)
          if (e.tapIndex == 0) {//回复
            that.setData({
              focus: true,
              index: id,
              comment_type: 1
            });
            that.revert();

          } else if (e.tapIndex == 1) {//删除
            wx.showModal({
              title: '提示信息',
              content: '是否确认删除！',
              showCancel: true,
              success: function (res) {
                if (res.confirm) {
                  var url = getApp().globalData.url; //url+'
                  wx.request({
                    url: url + 'interface/sProgram/user/deleteComment.do',
                    data: {
                      dynamicid: that.data.dynamicid,//动态ID
                      commentId: that.data.commonsList[id].commentid,//评论id
                      schoolid: wx.getStorageSync('schoolID'),//学校id
                      userid: that.data.commonsList[id].senderId,//用户id,
                      studentId: wx.getStorageSync('studentID'),// 	学生id
                    },
                    method: 'POST', // OPTIONS, GET, HEAD, POST, PUT, DELETE, TRACE, CONNECT 
                    header: { token: token }, // 设置请求的 header  
                    success: function (res) {
                      if (res.data.rtnCode == 10000) {
                        var param = {};
                        var string = "commonsList[" + id + "]";
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
    }
  },
  send_flowers: function (e) {
    if (this.data.send==1){

    }else{
    var i = 0;
    //赠送动态小红花
    wx.showToast({
      title: 'loading...',
      icon: 'loading',
      duration: 200000
    });
    var that = this;
    var dynFirstImage = ""; //动态封面（动态中第一张图片）
    if (that.data.dynamicList[i].res.length != 0) {
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
        console.log(res.data)
        wx.hideLoading();
        if (res.data.rtnCode == 10000) {
          var param = {};
          var string = "dynamicList[" + i + "].send";
          param[string] = '1';
          that.setData(param);
          //获取动态详情
          that.getInfo();
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
    }
  }

})