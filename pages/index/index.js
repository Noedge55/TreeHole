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
      'http://img02.tooopen.com/images/20150928/tooopen_sy_143912755726.jpg',
      'http://img06.tooopen.com/images/20160818/tooopen_sy_175866434296.jpg',
      'http://img06.tooopen.com/images/20160818/tooopen_sy_175833047715.jpg'
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
    inputContent:''
  },
  senLeaveMsg:function(e){
    if(e.detail.value.content == ""){
      console.log("留言不能为空");
    }else{
      // wx.getStorage({
      //   key: 'user_id',
      //   success: function(res) {
          
      //   },
      // });
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
          this.onShow();
        },
        error: function (result, error) {
          console.log("留言发布失败");
          console.log(error);
        }
      });
      this.setData({
        inputContent:''
      });
      this.onShow();
    }
  },
  onLoad: function () {
    console.log('onLoad');
  },

  onShow: function () {
    wx.showNavigationBarLoading();
    var msgList = new Array();

    that = this;
    getReturn(that);

    //查询数据总数
    var LeaveMsg = Bmob.Object.extend("leave_message");
    var query = new Bmob.Query(LeaveMsg);

    query.count({
      success:function(result){
        that.setData({
          count:result
        })
        console.log("总数据量：",result);
      }
    });
    // wx.hideNavigationBarLoading();
  },
  bindLoadMore:function(e){
    var limit = that.data.limit;
    that = this;
    console.log("上拉加载更多..." + limit);
    if (limit > that.data.pageSize && limit - that.data.pageSize >= that.data.count) {
      if(this.data.tempCount++ != 0){
        // common.showModal("已经是最后一页"+limit+","+that.data.pageSize+","+that.data.count);
        console.log("已经是最后一页" + limit + "," + that.data.pageSize + "," + that.data.count);
      }
      return false;
    }
    that.setData({
      limit : limit + that.data.pageSize
    });
    this.onShow();
  },
  
  pullDownRefresh: function(){
    wx.showNavigationBarLoading();
    setTimeout(function(){
      console.log("下拉刷新");
      that.setData({
        limit: that.data.pageSize,
        tempCount: 0
      })
      that.onShow();
    },1500)
    wx.hideNavigationBarLoading();
  }
})


function getReturn(){
  //判断是否为最后一页
  if(that.data.limit > that.data.pageSize && that.data.limit - that.data.pageSize >= that.data.count){
    console.log("已经是最后一页");
    return false;
  }

  var msgList = new Array();
  wx.getStorage({
    key: 'user_id',
    success: function(res) {
      if(res.data){
        var LeaveMsg = Bmob.Object.extend("leave_message");
        var query = new Bmob.Query(LeaveMsg);

        if(that.data.limit >= that.data.pageSize){
          query.limit(that.data.limit);
        }

        query.descending("createAt");
        query.include("user");

        query.find({
          success: function(results){
            for(var i = 0 ; i < results.length; i++){
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
              query1.equalTo("liker",Bmob.User.current());
              query1.equalTo("leavemsg",results[i]);
              query1.select("islike");
              query1.find().then(function(ress){
                isLike = ress;
              });

              var jsonA;
              jsonA = {
                "userId"  : userId   || '',
                "id"      : id       || '',
                "content" : content  || '',
                "createAt": createAt || '',
                "userPic" : userPic  || '',
                "likeNum" : likeNum  || 0 ,
                "replyNum": replyNum || 0 ,
                "isLike"  : isLike   || false,
                "time"    : createAt || "00:00:00",
              }
              msgList.push(jsonA);
            }
            that.setData({
              leaveMsgList : msgList
            });
          },
          error : function(error){
            common.dataLoading(error, "loading");
            console.log(error);
          }
        });
      }
    },
    fail: function(error){
      console.log("查询留言列表失败" + error);
    }
  })
}
