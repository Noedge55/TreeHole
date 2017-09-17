// pages/wallpapers/wallpapers.js
var app = getApp()
var Bmob = require('../../utils/bmob.js');
Page({

  /**
   * 页面的初始数据
   */
  data: {
    array:[{
        id:"img1",
        did: "delete1",
        picSrc:"/images/addpic.png",
        left: '125px',
        top: '15px',
        height: '128px',
        width: '128px',
        display:'none'
    },{
        id: "img2",
        did: "delete2",
        picSrc: "/images/addpic.png",
        left: '125px',
        top: '15px',
        height: '128px',
        width: '128px',
        display:'none'
    },{
        id: "img3",
        did:"delete3",
        picSrc: "/images/addpic.png",
        left: '125px',
        top: '15px',
        height: '128px',
        width: '128px',
        display:'none'
    }],
    windowHeight: wx.getStorageSync("windowHeight"),
    wallHeight: (wx.getStorageSync("windowHeight") - 100) / 3,
    display: '',
    list: []
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    var that = this;
    console.log(wx.getStorageSync("authority"));
    if (wx.getStorageSync("authority") == false) {
      that.setData({
        display: 'none'
      });
    }
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
  },
  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {

  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {

  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {

  },
  /**
   * 管理员插入轮播图图片
   */
  insertImg: function (event) {
    var that = this;
    var list
    console.log(event.target.id);
    wx.chooseImage({
      count: 1,
      sizeType: ['original', 'compressed'],
      sourceType: ['album', 'camera'],
      success: function (res) {
        var tempFilePaths = res.tempFilePaths
        switch(event.target.id){
          case "img1":
            that.setData({
              'array[0].picSrc': tempFilePaths,
              'array[0].display': '',
              'array[0].left':'0px',
              'array[0].top':'0px',
              'array[0].width':'100%',
              'array[0].height':'100%'
            });
            break;
          case "img2":
            that.setData({
              'array[1].picSrc': tempFilePaths,
              'array[1].display': '',
              'array[1].left': '0px',
              'array[1].top': '0px',
              'array[1].width': '100%',
              'array[1].height': '100%'
            });
            break;
          case "img3":
            that.setData({
              'array[2].picSrc': tempFilePaths,
              'array[2].display': '',
              'array[1].left': '0px',
              'array[1].top': '0px',
              'array[1].width': '100%',
              'array[1].height': '100%'
            });
            break;
        }
      },
      error: function (error) {

      }
    })
  },
  /**
   * 提交添加的图片
   */
  submitImg: function () {
    var that = this;
    var list = new Array();
    for(var i = 0 ; i < 3 ; i++){
      var filePath = that.data.array[i].picSrc;
      if (filePath != '/images/addpic.png') {
        wx.showLoading({
          title: '图片上传中',
        });
        var Json = {
          position:i + 1,
          picSrc:filePath
        }
        list.push(Json);
      }
    }
    console.log(list);
    var count = 0;
    for(var i = 0 ; i < list.length ;i++){
      count++;
      var name = list[i].position +"_"+ Date.parse(new Date()) + ".jpg";//上传的图片的别名，建议可以用日期命名
      var tempFilePath = list[i].picSrc;
      var position = list[i].position;
      console.log(name + "," + tempFilePath + "," + position);
      var file = new Bmob.File(name,tempFilePath);
      file.save().then(function(res){
        var Wallpaper = Bmob.Object.extend("wallpapers");
        var wallpaper = new Wallpaper();
        wallpaper.set("position", Number(res.name()[0]));
        wallpaper.set("picUrl",res.url());
        wallpaper.save(null,{
          success:function(result){//图片上传成功后提示
            console.log("轮播壁纸"+result.get("position")+"上传成功");
            wx.hideLoading();
            wx.showToast({
              title: '图片上传成功',
            });
            // app.globalData.swiperStatus = 0;
            that.resetImg();
          },
          error:function(error){
            console.log(error);
          }
        })
      });
    }
  },
  /**
   * 删除当前的图片
   */
  deleteImg:function(event){
    var that = this;
    switch(event.target.id){
      case "delete1":
        that.setData({
          'array[0].picSrc': "/images/addpic.png",
          'array[0].display': 'none',
          'array[0].left': '125px',
          'array[0].top': '15px',
          'array[0].width': '128px',
          'array[0].height': '128px'
        });
        break;
      case "delete2":
        that.setData({
          'array[1].picSrc': "/images/addpic.png",
          'array[1].display': 'none',
          'array[1].left': '125px',
          'array[1].top': '15px',
          'array[1].width': '128px',
          'array[1].height': '128px'
        });
        break;
      case "delete3":
        that.setData({
          'array[2].picSrc': "/images/addpic.png",
          'array[2].display': 'none',
          'array[2].left': '125px',
          'array[2].top': '15px',
          'array[2].width': '128px',
          'array[2].height': '128px'
        });
        break;
    }
  },
  resetImg:function(){
    var that = this;
    that.setData({
      'array[0].picSrc': "/images/addpic.png",
      'array[0].display': 'none',
      'array[1].picSrc': "/images/addpic.png",
      'array[1].display': 'none',
      'array[2].picSrc': "/images/addpic.png",
      'array[2].display': 'none',
    })
  }
})