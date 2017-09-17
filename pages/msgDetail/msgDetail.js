// pages/msgDetail/msgDetail.js
var app = getApp();
var Bmob = require('../../utils/bmob.js');
var common = require('../../utils/common.js');
var that ;
Page({
  /**
   * 页面的初始数据
   */
  data: {
    scrollViewHeight:wx.getStorageSync("windowHeight")-165,
    item:'',
    itemId:'',
    itemContent:'',
    itemPic:'',
    oldItemLikeNum:'',
    itemLikeNum:'',
    itemReplyNum:'',
    
    replyList:[],

    replyImgSrc:'/images/reply.png',
    likeImgSrc:'/images/like.png',
    inputContent:''
  },
  changeReplyImg:function(e){
    that = this;
    that.setData({
      replyImgSrc:'/images/reply_s.png'
    });
  },
  resetReplyImg:function(e){
    that = this;
    that.setData({
      replyImgSrc:'/images/reply.png'
    });
  },
  sendReplyMsg:function(e){
    that = this;
    var LeaveMsg = Bmob.Object.extend("leave_message");
    var query = new Bmob.Query(LeaveMsg);
    query.get(e.target.dataset.id,{
      success:function(result){
        var ReplyMsg = Bmob.Object.extend("reply_message");
        var replyMsg = new ReplyMsg();
        replyMsg.set("user",Bmob.User.current());
        replyMsg.set("leavemsg",result);
        replyMsg.set("content", e.detail.value.content);
        replyMsg.save(null,{
          success:function(result2){
            common.showModal("回复成功");
            app.globalData.refreshStatus = true;
            console.log(result2);
            //修改留言中的回复数量
            result.set('replynum',result.get('replynum')+1);
            result.save();
            that.setData({
              itemReplyNum: result.get('replynum'),
              inputContent:''
            });
            that.onShow();
          },
          error:function(e){
            console.log(e);
          }
        })
      }
    });
  },
  changeLike:function(e){
    var that = this;
    if (that.data.likeImgSrc == '/images/like.png'){
      that.setData({
        likeImgSrc: '/images/like_s.png',
        itemLikeNum: this.data.itemLikeNum + 1,
      })
    }else{
      that.setData({
        likeImgSrc: '/images/like.png',
        itemLikeNum: this.data.itemLikeNum - 1,
      })
    }
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    that = this;
    console.log(that.data.windowHeight);
    that.setData({
      itemId: options.itemId,
      itemPic: options.itemPic
    });
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
    var that = this;
    //查询该条留言的基本信息
    var LeaveMsg = Bmob.Object.extend("leave_message");
    var query = new Bmob.Query(LeaveMsg);
    query.get(that.data.itemId, {
      success: function (result) {
        //查询成功
        that.setData({
          item:result,
          itemContent: result.get("content"),
          oldItemLikeNum: result.get("likenum"),
          itemLikeNum: result.get("likenum"),
          itemReplyNum: result.get("replynum")
        });

        //查询当前用户是否点赞该条留言
        var IsLike = Bmob.Object.extend("is_like");
        var queryIsLike = new Bmob.Query(IsLike);
        var currentUser = Bmob.User.current();
        queryIsLike.equalTo("liker", currentUser);
        queryIsLike.equalTo("leavemsg", that.data.itemId);
        queryIsLike.find({
          success: function (results) {
            if (results.length == 0) {
              that.setData({
                likeImgSrc: '/images/like.png'
              });
            } else {
              that.setData({
                likeImgSrc: '/images/like_s.png'
              });
            }
          },
          error: function (error) {

          }
        });

        //查询该条留言下的所有回复信息
        var list = new Array();
        var ReplyMsg = Bmob.Object.extend("reply_message");
        var query1 = new Bmob.Query(ReplyMsg);
        query1.equalTo("leavemsg", that.data.itemId);
        query1.find({
          success: function (result1) {
            console.log("共查询到" + result1.length + "条reply信息");
            for (var i = 0; i < result1.length; i++) {
              var jsonB;
              jsonB = {
                "index": i + 1 || 0,
                "content": result1[i].get("content") || '',
                "backColor": result1[i].get("user").id == Bmob.User.current().id ? '#ADADAD' :'gainsboro'
              }
              list.push(jsonB);
            }
            console.log(list);
            that.setData({
              replyList: list
            });
          },
          error: function (object, error) {
            console.log(error);
          }
        })
      },
      error: function (object, error) {
        //查询失败
        console.log(error)
      }
    })
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
    var that = this;
    var IsLike = Bmob.Object.extend("is_like");
    if(that.data.oldItemLikeNum < that.data.itemLikeNum){
      var isLike = new IsLike();
      isLike.set("liker",Bmob.User.current());
      isLike.set("leavemsg",that.data.item);
      isLike.save(null,{
        success:function(result){
          console.log("喜欢");
          that.updateLike();
          app.globalData.refreshStatus = true;
        },
        error:function(object,error){
          console.log(error);
        }
      });
    } else if (that.data.oldItemLikeNum > that.data.itemLikeNum){
      var queryLike = new Bmob.Query(IsLike);
      queryLike.equalTo("liker",Bmob.User.current());
      queryLike.find().then(function (todos) {
        return Bmob.Object.destroyAll(todos);
      }).then(function (todos) {
        console.log(todos);
        // 删除成功
        that.updateLike();
        app.globalData.refreshStatus = true;
      }, function (error) {
        // 异常处理
      });
    }
  },
  updateLike:function(){
    var LeaveMsg = Bmob.Object.extend("leave_message");
    var query = new Bmob.Query(LeaveMsg);
    query.get(that.data.itemId, {
      success: function (result) {
        result.set('likenum', that.data.itemLikeNum);
        result.save();
      },
      error: function (object, error) {
        console.log(error);
      }
    });
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
  
  }
})