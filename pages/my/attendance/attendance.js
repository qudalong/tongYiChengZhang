// pages/my/attendance/attendance.js
Page({

  /**
   * 页面的初始数据
   */
  data: {
    nowData: '',//当前时间
    nowData2:'',//显示时间
    total: '',//出勤次数
    rtnData: '',//当日考勤记录
    left:'<',//后一天
    right:'>'//前一天
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    var that = this;
    var times = this.getNowFormatDate2(new Date());
    this.setData({
      nowData: times,
      nowData2: new Date()
    });
    //出勤次数
    this.AttendanceCountByMonth();
    //我的考勤-获取当天数据
    this.getAttendanceInfoByUser(this.data.nowData);
  },
  //出勤次数
  AttendanceCountByMonth: function () {
    var beginDate = this.getNowFormatDate(this.getCurrentMonthFirst());
    var endDate = this.getNowFormatDate(this.getCurrentMonthLast());
    var token = wx.getStorageSync('token');//token
    var url = getApp().globalData.url; //url+'
    //出勤次数
    wx.request({
      url: url + 'interface/sProgram/user/getSProgramAttendanceCountByMonth.do?userId=' + wx.getStorageSync('studentID') + '&beginDate=' + beginDate + '&endDate=' + endDate,
      data: {},
      method: 'GET', // OPTIONS, GET, HEAD, POST, PUT, DELETE, TRACE, CONNECT 
      header: { token: token }, // 设置请求的 header  
      success: function (res) {
        if (res.data.rtnCode == 10000) {
          that.setData({
            total: res.data.total
          });
        }
      }
    });
  },
  //前一天
  leftDate: function() {
    var that = this;
    var preDate = new Date(new Date(that.data.nowData2).getTime() - 24 * 60 * 60 * 1000); //前一天
    var times = this.getNowFormatDate2(preDate);
    this.setData({
      nowData: times,
      nowData2: preDate
    });
    this.getAttendanceInfoByUser(this.data.nowData);
  },
  //后一天
  rightDate: function () {
    var that = this;
    var times = this.getNowFormatDate2(new Date());
    if (this.data.nowData!=times){
      var nextDate = new Date(new Date(that.data.nowData2).getTime() + 24 * 60 * 60 * 1000); //后一天
      var times = this.getNowFormatDate2(nextDate);
      this.setData({
        nowData: times,
        nowData2: nextDate
      });
      this.getAttendanceInfoByUser(this.data.nowData);
    }
  },
  //获取当前月的第一天
  getCurrentMonthFirst: function () {
    var date = new Date();
    date.setDate(1);
    return date;
  },
  //获取当前月的最后一天
  getCurrentMonthLast: function () {
    var date = new Date();
    var currentMonth = date.getMonth();
    var nextMonth = ++currentMonth;
    var nextMonthFirstDay = new Date(date.getFullYear(), nextMonth, 1);
    var oneDay = 1000 * 60 * 60 * 24;
    return new Date(nextMonthFirstDay - oneDay);
  },
  //我的考勤-获取当天数据
  getAttendanceInfoByUser: function (datas) {
    var that = this;
    var token = wx.getStorageSync('token');//token
    var url = getApp().globalData.url; //url+'
    wx.request({
      url: url + 'interface/sProgram/user/getAttendanceInfoByUser.do?userId=' + wx.getStorageSync('studentID') + '&morningTime=' + datas + '&afternoonTime=' + datas,
      data: {},
      method: 'GET', // OPTIONS, GET, HEAD, POST, PUT, DELETE, TRACE, CONNECT 
      header: { token: token }, // 设置请求的 header  
      success: function (res) {
        if (res.data.rtnCode == 10000) {
          that.setData({
            rtnData: res.data.rtnData
          });
        }
      }
    });
  },
  bindDateChange: function (e) {
    var times = this.getNowFormatDate2(new Date(e.detail.value));
    this.setData({
      nowData: times,
      nowData2: e.detail.value
    });
    this.getAttendanceInfoByUser(this.data.nowData);
  },
  getNowFormatDate: function (date) {
    var seperator1 = "-";
    var seperator2 = ":";
    var month = date.getMonth() + 1;
    var strDate = date.getDate();
    if (month >= 1 && month <= 9) {
      month = "0" + month;
    }
    if (strDate >= 0 && strDate <= 9) {
      strDate = "0" + strDate;
    }
    var currentdate = date.getFullYear() + seperator1 + month + seperator1 + strDate;
    return currentdate;
  },
    getNowFormatDate2: function (date) {
    var seperator1 = "-";
    var seperator2 = ":";
    var month = date.getMonth() + 1;
    var strDate = date.getDate();
    if (month >= 1 && month <= 9) {
      month = "0" + month;
    }
    if (strDate >= 0 && strDate <= 9) {
      strDate = "0" + strDate;
    }
    var currentdate = date.getFullYear() + "年" + month + "月" + strDate+"日";
    return currentdate;
  }
})