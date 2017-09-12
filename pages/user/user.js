//获取应用实例
var app = getApp()
var Bmob = require('../../utils/bmob.js');
Page({
  data: {
    motto: 'Hello World',
    picSrc: Bmob.User.current().get("userPic"),
    myopenid : wx.getStorageSync("user_openid"),
    nickName: wx.getStorageSync("my_nick"),
  },
  //事件处理函数
  changeHeadPic: function () {
    wx.chooseImage({
      count:1,
      sizeType: ['compressed'],
      sourceType: ['album', 'camera'],
      success: function(res) {
        var tempFilePaths = res.tempFilePaths;
        if (tempFilePaths.length > 0) {
          var name = Date.parse(new Date()) + ".jpg";//上传的图片的别名，建议可以用日期命名
          var file = new Bmob.File(name, tempFilePaths);
          file.save().then(function (res) {
            console.log(res.url());
            var user = Bmob.User.current({
              success:function(user){
                
              }
            });
          }, function (error) {
            console.log(error);
          })
        }
      },
    });
  },
  onLoad: function () {
    console.log('onLoad');
  },
  onShow: function()  {
    console.log('onShow');
  }
})
