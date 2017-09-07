//获取应用实例
var app = getApp()
var Bmob = require('../../utils/bmob.js');
Page({
  data: {
    motto: 'Hello World',
    picSrc: wx.getStorageSync('my_avatar'),
    myopenid : wx.getStorageSync("user_openid"),
    nickName: wx.getStorageSync("my_nick"),
  },
  //事件处理函数
  bindViewTap: function () {
    wx.navigateTo({
      url: '../logs/logs'
    })
  },
  onLoad: function () {
    console.log('onLoad');
  },
  onShow: function()  {
    console.log('onShow');
  }
})
