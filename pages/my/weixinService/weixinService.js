// pages/my/weixinService/weixinService.js
Page({

  /**
   * 页面的初始数据
   */
  data: {

  },
  saveImgToPhotosAlbumTap: function () {
    var url = getApp().globalData.url; //url+'
    wx.downloadFile({
      url: url + 'img/mobile/ordIcon/kaitongweicin@3x.png',
      success: function (res) {
        //console.log(res)
        wx.saveImageToPhotosAlbum({
          filePath: res.tempFilePath,
          success: function (res) {
            //console.log(res)
          },
          fail: function (res) {
           // console.log(res)
            //console.log('fail')
          }
        });
      },
      fail: function () {
       // console.log('fail')
      }
    });
  }
})