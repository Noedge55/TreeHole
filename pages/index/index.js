//index.js
//获取应用实例
var app = getApp()
var Bmob = require('../../utils/bmob.js');
var Common = require('../../utils/common.js');
var that ;
Page({
  data: {
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
    pageSize: 2,
    limit : 2,
    count : 0
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
        },
        error: function (result, error) {
          console.log("留言发布失败");
          console.log(error);
        }
      });
    }
  },
  onLoad: function () {
    console.log('onLoad');
  },
  onShow: function () {
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
  }
})

function getReturn(){
  //判断是否为最后一页
  if(that.data.limit > that.data.pageSize && that.data.limit - that.data.pageSize >= that.data.count){
    console.log("已经是最后一页");
    return false;
  }

}
