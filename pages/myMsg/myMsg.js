// pages/myMsg/myMsg.js
var Bmob = require('../../utils/bmob.js');
Page({

  /**
   * 页面的初始数据
   */
  data: {
    windowHeight: wx.getStorageSync("windowHeight"),
    scrollHeight: wx.getStorageSync("windowHeight"),
    display:'',
    lmList:'',
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    let that = this;
    that.setData({
      display:options.display
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
    let that = this;
    if(that.data.display === "none"){
      wx.setNavigationBarTitle({
        title: '我的留言',
      })
      let LeaveMsg = Bmob.Object.extend("leave_message");
      let query = new Bmob.Query(LeaveMsg);
      query.equalTo("user",Bmob.User.current());
      query.find({
        success:function(results){
          console.log(results);
          let list = new Array();
          for(let i = 0 ; i < results.length ; i++){
            let jsonA;
            jsonA = {
              lmId:results[i].id,
              lmContent:results[i].get("content"),
              msgTime: results[i].createdAt.substring(0, 10)
            }
            list.push(jsonA);
          }
          that.setData({
            lmList:list
          });
        },
        error:function(error){
          console.log(error);
        }
      })
    }else{
      wx.setNavigationBarTitle({
        title: '我的回复',
      })
      let ReplyMsg = Bmob.Object.extend("reply_message");
      let query = new Bmob.Query(ReplyMsg);
      query.equalTo("user",Bmob.User.current());
      query.ascending("leavemsg");
      query.find({
        success:function(results){
          var rmId = '';
          var list = new Array();
          for(let i = 0 ; i < results.length ; i++){
            if(results[i].get("leavemsg").id == rmId){
              continue;
            }
            rmId = results[i].get("leavemsg").id;
            //查询该条回复对应的留言
            let LeaveMsg = Bmob.Object.extend("leave_message");
            let query1 = new Bmob.Query(LeaveMsg);
            query1.get(results[i].get("leavemsg").id, {
              success: function (result) {
                let jsonA = {
                  lmId: results[i].get("leavemsg").id,//获取回复id
                  rmId: results[i].id,//获取留言id
                  rmContent: results[i].get("content"),//获取回复内容
                  lmContent: result.get("content"),//获取对应留言内容
                  msgTime: results[i].createdAt.substring(0,10)
                }
                list.push(jsonA);
                that.setData({
                  lmList: list
                });
              },
              error: function (error) {
                console.log(error);
              }
            })
          }
        },
        error:function(error){
          console.log(error);
        }
      })
    }
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