// pages/ordered/publish/publish.js
const qiniuUploader = require("../../../utils/qiniuUploader");
// 初始化七牛相关参数
function initQiniu(uploadToken) {
  var url = getApp().globalData.url; //url+'
  var options = {
    region: 'ECN', // 区
    uptokenURL: url + "interface/dynamic/getUptoken.do",
    uptoken: uploadToken,
    domain: 'http://qinwh.qiniudn.com/',//http://tycz.qiniudn.com   //http://qinwh.qiniudn.com
    shouldUseQiniuFileName: true,
  };
  qiniuUploader.init(options);
}
Page({
  /**
   * 页面的初始数据
   */
  data: {
    array: [],//列表
    video: '',//视频
    content: '',//内容
    photos: [],//照片列表
    videos: [],//视频列表
    videos2: [],//视频列表2
    uploadToken: '',//七牛上传Token
    str: {//图片
      name: '',
      shoottime: ''
    },
    str2: {//视频
      name: '',//视频名称（key）
      thumbpath: '',// 	缩略图（key）
      size: '',//视频大小（ＫＢ）
      length: ''//视频长度
    },
    a: 0//点击事件控制
  },
  onLoad: function (options) {
    //获取七牛上传Token
    var that = this;
    var token = wx.getStorageSync('token');//token
    var url = getApp().globalData.url; //url+'
    wx.request({
      url: url + 'interface/dynamic/getUptoken.do',
      data: {},
      method: 'POST', // OPTIONS, GET, HEAD, POST, PUT, DELETE, TRACE, CONNECT 
      header: { token: token }, // 设置请求的 header  
      success: function (res) {
        //console.log(res.data)
        if (res.data.rtnCode == 10000) {
          initQiniu(res.data.rtnData[0].uploadToken);
          that.setData({
            uploadToken: res.data.rtnData[0].uploadToken
          });
        } else {
        }
      }
    });
  },
  //发布
  publish: function () {
    var that = this;
    if (that.data.a == 0) {
      that.setData({
        a: 1
      });
      var token = wx.getStorageSync('token');//token
      console.log(that.data.str2.name)
      if (that.data.str2.name == "") {
        that.setData({
          videos: []
        });
      } else {
        that.setData({
          videos: that.data.videos.concat(that.data.str2)
        });
      }
      //发布动态
      wx.showToast({
        title: 'loading...',
        icon: 'loading',
        duration: 200000
      });
      //console.log(that.data.photos)
      wx.request({
        url: 'https://b.lebeitong.com/interface/sProgram/user/public.do',
        data: {
          schoolId: wx.getStorageSync('schoolID'),// 	学校id
          userId: wx.getStorageSync('usersid'),//家长id
          curStudentId: wx.getStorageSync('studentID'),// 	当前学生Id
          name: wx.getStorageSync('userName'),//家长姓名
          roleId: 3,//角色id 3
          content: that.data.content,// 	动态内容
          eduUnitIdStr: wx.getStorageSync('unitID'),//当前所在班级id
          receiverType: 4,//接收人范围 4.全部
          photos: that.data.photos,//照片列表
          videos: that.data.videos,//视频列表
          platform: 19,//平台标识 19
        },
        method: 'POST', // OPTIONS, GET, HEAD, POST, PUT, DELETE, TRACE, CONNECT 
        header: { token: token }, // 设置请求的 header  
        success: function (res) {
          //console.log(res.data)
          wx.hideLoading();
          if (res.data.rtnCode == 10000) {
            that.setData({
              a: 0
            });
            wx.showModal({
              title: '提示信息',
              content: '发布成功，小红花+' + res.data.rtnData[1],
              showCancel: false,
              confirmText: "确定",
              success: function (res) {
                //console.log('用户点击的确定,跳转首页')
                that.toNotice();
              }
            })
          } else {
            wx.showModal({
              title: '提示信息',
              content: res.data.result,
              showCancel: false,
              confirmText: "确定",
              success: function (res) {
                // console.log('用户点击的确定')
              }
            })
          }
        }
      });
    }
  },
  actionSheetTap: function () {
    var that = this;
    if (that.data.array.length == 30) {
      wx.showModal({
        title: '提示信息',
        content: "最多可以上传30张！",
        showCancel: false,
        confirmText: "确定",
        success: function (res) {
        }
      })
    } else {
      var url = getApp().globalData.url; //url+'
      wx.showActionSheet({
        itemList: ['拍照', '从手机相册选择'],
        success: function (e) {
          //console.log(e.tapIndex)
          var source_type = ['album'];
          if (e.tapIndex == 0) {
            source_type = ['camera'];
          }
          wx.chooseImage({
            count: 30, // 默认9
            sizeType: ['compressed'], // 可以指定是原图还是压缩图，默认二者都有
            sourceType: source_type, // 可以指定来源是相册还是相机，默认二者都有
            success: function (res) {
              // 返回选定照片的本地文件路径列表，tempFilePath可以作为img标签的src属性显示图片
              var tempFilePaths = res.tempFilePaths;
              //console.log(tempFilePaths)
              // that.setData({
              //   array: that.data.array.concat(res.tempFilePaths)
              // })
              if ((that.data.array.length + res.tempFilePaths.length) > 30) {
                wx.showModal({
                  title: '提示信息',
                  content: "最多可以上传30张！",
                  showCancel: false,
                  confirmText: "确定",
                  success: function (res) {
                  }
                })
              }
              wx.showToast({
                title: 'loading...',
                icon: 'loading',
                duration: 200000
              });
              // 交给七牛上传
              for (var i = 0; i < res.tempFilePaths.length; i++) {
                var timestamp = Date.parse(new Date());
                timestamp = timestamp / 1000;
                if (that.data.array.length != 30) {
                  qiniuUploader.upload(res.tempFilePaths[i], (res) => {
                    if (that.data.array.length == 30) {
                      wx.hideLoading();
                    } else {
                      // console.log(res)
                      that.setData({
                        'str.name': res.imageURL,
                        'str.shoottime': new Date()
                      });
                      that.setData({
                        array: that.data.array.concat(res.imageURL)
                      });
                      //console.log(that.data.str)
                      that.setData({
                        photos: that.data.photos.concat(that.data.str)
                      });
                      //console.log(that.data.photos)
                    }
                  }, (error) => {
                    //console.error('error: ' + JSON.stringify(error));
                  }
                    , {
                      region: 'ECN', // 区
                      uptokenURL: url + "interface/dynamic/getUptoken.do",
                      uptoken: that.data.uploadToken,
                      domain: 'http://qinwh.qiniudn.com/', key: 'img_' + timestamp + i
                    }
                  );
                }
                if (i == (res.tempFilePaths.length-1)){
                  wx.hideLoading();
                } 
              }
            }
          })
        }
      })
    }
  },
  //删除图片array，photos
  delete: function (e) {
    var that = this;
    var index = e.currentTarget.dataset.index;
    var images = that.data.array;
    images.splice(index, 1);

    that.setData({
      array: images,
      photos: images
    });
    // console.log(that.data.array)
    //console.log(that.data.photos)
  },
  //删除视频
  deleteVideo: function () {
    this.setData({
      'str2.size': '',
      'str2.name': '',
      'str2.length': '',
      video: ''
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
  listenerBtnOpenVideo: function () {
    var that = this;
    var url = getApp().globalData.url; //url+'
    wx.showActionSheet({
      itemList: ['相机', '从手机相册选择'],
      success: function (e) {
        // console.log(e.tapIndex)
        var source_type = ['album'];
        if (e.tapIndex == 0) {
          source_type = ['camera'];
        }
        wx.chooseVideo({
          //相机和相册
          sourceType: source_type,
          //录制视频最大时长
          maxDuration: 60,
          //摄像头
          camera: ['front', 'back'],
          //这里返回的是tempFilePaths并不是tempFilePath
          success: function (res) {
             console.log(res)
            that.setData({
              'str2.size': res.size,
              'str2.length': res.duration,
              video2: res.tempFilePath
            });
            wx.showToast({
              title: 'loading...',
              icon: 'loading',
              duration: 200000
            });
            //视频上传七牛
            var timestamp = Date.parse(new Date());
            timestamp = timestamp / 1000;
            qiniuUploader.upload(res.tempFilePath, (res) => {
              //视频上传成功console.log(res)
              console.log(res)
              wx.hideLoading();
              that.setData({
                video:that.data.video2,
                'str2.name': res.imageURL,//视频地址
                'str2.thumbpath': res.imageURL + '?vframe/jpg/offset/2/w/420/h300'//使用七牛默认方法获取缩略图方法
              });
            },
              (error) => {
                //视频上传失败，可以在七牛的js里面自己加了一个err错误的返回值
                // console.log('error: ' + error)
                wx.hideLoading();
              },
              {
                region: 'ECN', // 区
                uptokenURL: url + "interface/dynamic/getUptoken.do",
                uptoken: that.data.uploadToken,
                domain: 'http://qinwh.qiniudn.com/', key: 'video_' + timestamp
              });
            // 缩略图交给七牛上传---------因iPhone 6s plus 无法获取本地选中视频缩略图，故使用七牛默认方法获取缩略图方法
            // qiniuUploader.upload(res.thumbTempFilePath, (res) => {
            //    console.log(res)
            //   that.setData({
            //     'str2.thumbpath': res.imageURL
            //   });
            // }, (error) => {
            //   //console.error('error: ' + JSON.stringify(error));
            // }
            //   , {
            //     region: 'ECN', // 区
            //     uptokenURL: url + "interface/dynamic/getUptoken.do",
            //     uptoken: that.data.uploadToken,
            //     domain: 'http://qinwh.qiniudn.com/', key: 'img_' + timestamp
            //   }
            // );
          },
          fail: function (e) {
            // console.log(e)
          }
        })
      }
    })

  },
  /**
   * 监听输入
   */
  bindInput: function (e) {
    this.setData({
      content: e.detail.value
    });
  },
  toNotice: function () {
    wx.showToast({
      title: 'loading...',
      icon: 'loading',
      duration: 200000
    });
    wx.redirectTo({
      url: '/pages/ordered/notice/notice'
    });
  }
})