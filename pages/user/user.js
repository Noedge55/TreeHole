//获取应用实例
var app = getApp()
var Bmob = require('../../utils/bmob.js');
Page({
  data: {
    motto: 'Hello World',
    picSrc: wx.getStorageSync("my_avatar"),
    myopenid : wx.getStorageSync("user_openid"),
    nickName: wx.getStorageSync("my_nick"),
    display:wx.getStorageSync('authority')==true?'':'none'
  },
  //事件处理函数
  changeHeadPic: function () {
    var that = this;
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
            var user = Bmob.User.logIn(that.data.nickName, that.data.myopenid, {
              success: function (users) {
                users.set('userPic', res.url());  // attempt to change username
                users.save(null, {
                  success: function (user) {
                    console.log("头像修改成功"+user);
                    wx.setStorageSync("userPic",user.get("userPic"));
                    wx.showToast({
                      title: '头像修改成功',
                    });
                    app.globalData.refreshStatus = true;
                    that.onShow();
                  }
                });
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
    var that = this;
    console.log('onLoad');
    var User = Bmob.Object.extend("_User");
    var query = new Bmob.Query(User);
    query.get(Bmob.User.current().id, {
      success: function (user) {
        console.log(user);
        wx.setStorageSync('my_avatar', user.get("userPic"));
        wx.setStorageSync('authority',user.get("authority"));
        that.setData({
          picSrc: user.get("userPic"),
          display: user.get("authority")
        })
      },
      error: function (error) {
        console.log(error);
      }
    })
  },
  onShow: function()  {
    console.log('onShow');
  }
})
