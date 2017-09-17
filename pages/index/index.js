//index.js
//获取应用实例
var app = getApp()
var Bmob = require('../../utils/bmob.js');
var common = require('../../utils/common.js');
var that ;
Page({
  data: {
    scrollViewHeight: wx.getStorageSync("windowHeight") - 250,
    imgUrls: [
      '',
      '',
      ''
    ],
    indicatorDots: true,
    autoplay: true,
    interval: 3000,
    duration: 1000,
    imgList: app.globalData.imgList,
    leaveMsgList: [],
    pageSize: 5,
    limit : 5,
    count : 0,
    tempCount:0,
    inputContent:'',
    upstatus:false,
    downstatus:false,
  },
  onLoad: function () {
    console.log('onLoad');
    this.getSwiperImg();
    wx.getSystemInfo({
      success: function(res) {
        console.log(res.windowWidth);
      },
    })
  },
  onShow: function () {
    wx.showLoading({
      title: '加载中',
    })
    that = this;
    if (app.globalData.refreshStatus == true){
      that.setData({
        limit:5,
        leaveMsgList: []
      })
      app.globalData.refreshStatus = false;
    }
    //获取留言总数
    var LeaveMsg = Bmob.Object.extend("leave_message");
    var query = new Bmob.Query(LeaveMsg);

    query.count({
      success: function (result) {
        that.setData({
          count: result
        })
        if(result != that.data.tempCount){
          that.setData({
            tempCount:result,
            limit:5,
            leaveMsgList: [],
          })
        }
        if (app.globalData.swiperStatus == 0){
          that.getSwiperImg();
          app.globalData.swiperStatus = 1;
        }
        console.log("总数据量：", result);
        // that.getSwiperImg();    //获取轮播图片
        //判断是否为最后一页
        if (that.data.limit - that.data.pageSize >= that.data.count) {
          console.log("已经是最后一页");
          wx.hideLoading();
        } else {//获取留言列表
          that.getLeaveList();
        }
      },
      error:function(error){
        console.log(error);
      }
    });
  },
  /**
   * 查询数据总数
   */
  getDataCount:function(){
    var that = this;
    var LeaveMsg = Bmob.Object.extend("leave_message");
    var query = new Bmob.Query(LeaveMsg);

    query.count({
      success: function (result) {
        that.setData({
          count: result
        })
        console.log("总数据量：", result);
      }
    });
  },
  /**
   * 获取轮播图片
   */
  getSwiperImg:function(){
    // if (app.globalData.swiperStatus == 0) {
      

    // }
    var Wallpaper = Bmob.Object.extend("wallpapers");
    var query = new Bmob.Query(Wallpaper);
    for (var i = 1; i <= 3; i++) {
      query.equalTo("position", i);
      query.descending("createdAt");
      query.first({
        success: function (object) {
          console.log(object);
          var position = 'imgUrls[' + (object.get("position") - 1) + ']';
          that.setData({
            [position]: object.get("picUrl")
          })
          // app.globalData.swiperStatus = 1;
          wx.hideLoading();
        },
        error: function (error) {
          console.log(error);
        }
      })
    }
  },
  /**
   * 获取留言列表
   */
  getLeaveList:function(){
    var that = this;
    var msgList = new Array();
    // var skipSize = (that.data.limit) - (that.data.pageSize);
    wx.getStorage({
      key: 'user_id',
      success: function (res) {
        if (res.data) {
          var LeaveMsg = Bmob.Object.extend("leave_message");
          var query = new Bmob.Query(LeaveMsg);
          // query.skip(skipSize);
          query.limit(that.data.limit);
          query.descending("createdAt");
          query.include("user");
          query.find({
            success: function (results) {
              for (var i = 0; i < results.length; i++) {
                var userId = results[i].get("user").id; //获取用户id
                var content = results[i].get("content");//获取留言内容
                var id = results[i].id;//获取留言id
                var createAt = results[i].createdAt.substring(0, 10);//获取留言创建时间
                var userPic = results[i].get("user").get("userPic");//获取用户头像
                var likeNum = results[i].get("likenum");//获取留言被赞次数
                var replyNum = results[i].get("replynum");//获取留言被回复次数

                var isLike = false;

                var Lk = Bmob.Object.extend("is_like");
                var query1 = new Bmob.Query(Lk);
                query1.equalTo("liker", Bmob.User.current());
                query1.equalTo("leavemsg", results[i]);
                query1.select("islike");
                query1.find().then(function (ress) {
                  isLike = ress;
                });

                var jsonA;
                jsonA = {
                  "userId": userId || '',
                  "id": id || '',
                  "content": content || '',
                  "createAt": createAt || '',
                  "userPic": userPic || '',
                  "likeNum": likeNum || 0,
                  "replyNum": replyNum || 0,
                  "isLike": isLike || false,
                  "time": createAt || "00:00:00",
                }
                msgList.push(jsonA);
              }
              that.setData({
                leaveMsgList: msgList
              });
              wx.hideLoading();
            },
            error: function (error) {
              common.dataLoading(error, "loading");
              console.log(error);
            }
          });
        }
      },
      fail: function (error) {
        console.log("查询留言列表失败" + error);
      }
    })
  },
  /**
   * 上拉加载更多
   */
  bindLoadMore:function(e){
    var that = this;
    var limit = that.data.limit;
    if (limit - that.data.pageSize < that.data.count) {
      if(that.data.upstatus == false){
        that.setData({
          upstatus:true
        });
        setTimeout(function(){
          console.log("上拉加载更多..." + limit);
            that.setData({
              limit: limit + that.data.pageSize,
              upstatus:false
            });
          that.onShow();
        },1000)
    }
    }
    // if (limit > that.data.pageSize && limit - that.data.pageSize >= that.data.count) {
    //   if(this.data.tempCount++ != 0){
    //     // common.showModal("已经是最后一页"+limit+","+that.data.pageSize+","+that.data.count);
    //     console.log("已经是最后一页" + limit + "," + that.data.pageSize + "," + that.data.count);
    //   }
    //   return false;
    // }
  },
  /**
   * 下拉刷新
   */
  pullDownRefresh: function(){
    // wx.showLoading({
    //   title: '加载中',
    // })
    console.log("下拉刷新");
    // that.setData({
    //   limit: that.data.pageSize,
    //   tempCount: 0
    // })
    // that.onShow();
    // wx.hideLoading();
  },
  senLeaveMsg: function (e) {
    var that = this;
    if (e.detail.value.content == "") {
      console.log("留言不能为空");
    } else {
      var LeaveMsg = Bmob.Object.extend("leave_message");
      var leaveMsg = new LeaveMsg();
      var currentUser = Bmob.User.current();
      leaveMsg.set("user", currentUser);
      leaveMsg.set("content", e.detail.value.content);
      leaveMsg.set("likenum", 0);
      leaveMsg.set("replynum", 0);

      leaveMsg.save(null, {
        success: function (result) {
          console.log("留言发布成功,objectId:" + result.id);
          common.showModal("留言发布成功");
          app.globalData.refreshStatus = true;
          that.onShow();
        },
        error: function (result, error) {
          console.log("留言发布失败");
          console.log(error);
        }
      });
      that.setData({
        inputContent: ''
      });
      that.onShow();
    }
  },
  onShareAppMessage:function(){
    
  }
})
