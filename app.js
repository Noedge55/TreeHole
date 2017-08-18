//app.js
var Bmob = require('utils/bmob.js');
var common = require("utils/common.js");
Bmob.initialize("a8ce6e755b8b5225d5deb31c4961bd38","9398196e6d39320f841bc3fa92a23a37");
App({
  onLaunch: function() {
    //调用API从本地缓存中获取数据
    var logs = wx.getStorageSync('logs') || []
    logs.unshift(Date.now())
    wx.setStorageSync('logs', logs);
    try{
      var value = wx.getStorageSync('user_openid');
      if(!value){
        wx.login({
          success:function(res){
            if(res.code){
              Bmob.User.requestOpenId(res.code,{
                success:function(userData){
                  wx.getUserInfo({
                    success:function(result){
                      var userInfo = result.userInfo;
                      var nickName = userInfo.nickName;
                      var picName = getApp().globalData.imgList[Math.floor(Math.random()*8)];
                      var avatarUrl = "../../images/user_img/"+picName+".png";
                      Bmob.User.logIn(nickName,userData.openid,{
                        success:function(user){
                          try{
                            wx.setStorageSync('user_openid',user.get("userData").openid);
                            wx.setStorageSync('user_id',user.id);
                            wx.setStorageSync('my_nick',user.get("nickname"));
                            wx.setStorageSync('my_username',user.get("username"));
                            wx.setStorageSync('my_avatar', user.get("userPic"));
                          }catch(e){

                          }
                          console.log("登录成功");
                        },
                        error:function(user,error){
                          if(error.code=="101"){
                            var user = new Bmob.User();//开始注册用户
                            user.set("username",nickName);  //设置用户名
                            user.set("password",userData.openid);//设置密码，用openid作为密码
                            user.set("nickname",nickName);
                            user.set("userPic",avatarUrl);
                            user.set("userData",userData);
                            user.signUp(null,{
                              success:function(results){
                                console.log("注册成功");
                                try{
                                  wx.setStorageSync('user_openid', results.get("userData").openid);
                                  wx.setStorageSync('user_id', results.id);
                                  wx.setStorageSync('my_nick', results.get("nickname"));
                                  wx.setStorageSync('my_username', results.get("username"));
                                  wx.setStorageSync('my_avatar', results.get("userPic"));
                                }catch(e){

                                }
                              },
                              error:function(userData,error){
                                console.log(error);
                              }
                            });
                          }
                        }
                      });
                    }
                  });
                }
              });
            }else{
              console.log('获取用户登录状态失败！' + res.errMsg);
            }
          }
        });
      }
    }catch(e){

    }
    wx.checkSession({
      success:function(){
      },
      fail:function(){
        //登陆态过期
        wx.login();
      }
    });
  },

  getUserInfo: function(cb) {
    var that = this
    if (this.globalData.userInfo) {
      typeof cb == "function" && cb(this.globalData.userInfo)
    } else {
      //调用登录接口
      wx.getUserInfo({
        withCredentials: false,
        success: function(res) {
          that.globalData.userInfo = res.userInfo
          typeof cb == "function" && cb(that.globalData.userInfo)
        }
      })
    }
  },

  globalData: {
    userInfo: null,
    imgList: ['rabit', 'dog', 'chameleon', 'cock', 'elephant', 'hippo', 'squirrel', 'whale']
  }
})
