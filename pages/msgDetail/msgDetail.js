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
    itemId:'',
    itemContent:'',
    itemPic:'',
    itemLikeNum:'',
    itemReplyNum:'',

    replyImgSrc:'/images/reply.png',
    likeImgSrc:'/images/like.png',
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
            console.log(result2);
            //修改留言中的回复数量
            result.set('replynum',result.get('replynum')+1);
            result.save();
            that.setData({
              itemReplyNum: result.get('replynum')
            });
          },
          error:function(e){
            console.log(e);
          }
        })
      }
    });
  },
  changeLike:function(e){
    
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    that = this;
    that.setData({
      itemId:options.itemId,
      itemContent:options.itemContent,
      itemPic:options.itemPic,
      itemLikeNum:options.itemLikeNum,
      itemReplyNum:options.itemReplyNum
    })
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
  
  }
})