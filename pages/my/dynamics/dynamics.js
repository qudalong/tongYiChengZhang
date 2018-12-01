// pages/my/dynamics/dynamics.js
Page({
  /**
   * 页面的初始数据
   */
  data: {
    dynamicList: [],//动态内容
    conmment_time: '',//发布时间
    page: 0,   // 设置加载的第几次，默认是第一次  
    size: 10,      //返回数据的个数 
    shareId: '',//分享id
    a: 0//点击事件控制
  },
  onLoad: function () {
    var that = this;
    that.dynamic();
  },
  //下一页
  onReachBottom: function () {
    this.dynamic();
    // console.log('circle 下一页');
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
    this.setData({
      conmment_time: result
    });
  },
  //我的动态
  dynamic: function () {
    var that = this;
    var token = wx.getStorageSync('token');//token
    var url = getApp().globalData.url; //url+'
    wx.request({
      url: url + 'interface/sProgram/user/selectMyDynamicInfo.do?schoolId=' + wx.getStorageSync('schoolID') + '&parentId=' + wx.getStorageSync('usersid') + '&studentId=' + wx.getStorageSync('studentID') + '&page=' + that.data.page + '&size=' + that.data.size,
      data: {},
      method: 'GET', // OPTIONS, GET, HEAD, POST, PUT, DELETE, TRACE, CONNECT 
      header: { token: token }, // 设置请求的 header  
      success: function (res) {
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
  //更多
  select_more: function (e) {
    var that = this;
    var i = e.currentTarget.id
    wx.showActionSheet({
      itemList: ['删除'],
      success: function (e) {
        //console.log(e.tapIndex)
        if (e.tapIndex == 0) {
          //删除
          var token = wx.getStorageSync('token');//token
          var url = getApp().globalData.url; //url+'
          wx.request({
            url: url + 'interface/sProgram/user/deleteDynamic.do',
            data: {
              dynamicid: that.data.dynamicList[i].dynamicid,//动态ID
              schoolid: wx.getStorageSync('schoolID'),//学校id
              type: that.data.dynamicList[i].type,//
              userid: that.data.dynamicList[i].senderId,//用户id,
              eduunitid: wx.getStorageSync('unitID'),//班级id
              studentId: that.data.dynamicList[i].senderRefId,// 	学生id
            },
            method: 'POST', // OPTIONS, GET, HEAD, POST, PUT, DELETE, TRACE, CONNECT 
            header: { token: token }, // 设置请求的 header  
            success: function (res) {
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
        }
      }
    });
  },
  //分享
  onShareAppMessage: function (res) {
    var that = this;
    if (res.from === 'button') {
      // 来自页面内转发按钮
    }
    return {
      title: '我的动态分享',
      path: '/pages/ordered/dynamicDetails/dynamicDetails?dynamicId=' + that.data.shareId + '&commentaries=2',
      success: function (res) {
        // 转发成功
        //console.log('转发成功')
      },
      fail: function (res) {
        // 转发失败
        // console.log('转发失败')
      }
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
    var dynamicId = e.currentTarget.id
    wx.navigateTo({
      url: '/pages/ordered/dynamicDetails/dynamicDetails?dynamicId=' + dynamicId + '&commentaries=0'
    });
    }
  }

})
