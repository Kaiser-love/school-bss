var config = require('../../comm/script/config')
var app = getApp()
Page({
  data: {
    projectSource: 'https://github.com/liuxuanqiang/wechat-weapp-mall',
    userListInfo: [{
      icon: '../../images/iconfont-dingdan.png',
      text: '我的发表',
      isunread: true,
      unreadNum: 2
    }, {
        icon: '../../images/icon/chat.png',
      text: '我的收藏',
      isunread: false,
      unreadNum: 2
    }, {
     icon: '../../images/icon/view.png',
      text: '我的评论',
      isunread: true,
      unreadNum: 1
    },  {
      icon: '../../images/iconfont-kefu.png',
      text: '联系客服'
    }, {
      icon: '../../images/iconfont-help.png',
      text: '常见问题'
    }],
  },
  gotoPage(e) {
    var index = e.currentTarget.dataset.index
    app.navigateTo('../posts/posts?index='+index, '帖子信息')
  },
  addArticle: function () {
    app.navigateTo('../send/send', '发帖页')
  },
  viewSkin: function () {
    wx.navigateTo({
      url: "../skin/skin"
    })
  },
  onLoad(){
    this.setData({
      skin: config.skinList[0].imgUrl
    })
    var that = this
    // 检测是否存在用户信息
    if (app.globalData.userInfo != null) 
      that.setData({
        userInfo: app.globalData.userInfo
      })
     else 
      app.getUserInfo()
  },
  bindGetUserInfo: function (e) {
    var that = this;
    //此处授权得到userInfo
    console.log(e.detail.userInfo);
    //接下来写业务代码
    app.globalData.userInfo = e.detail.userInfo
  },
  onShow: function () {
    var that = this
    wx.getStorage({
      key: 'skin',
      success: function (res) {
        if (res.data == "") {
          that.setData({
            skin: config.skinList[0].imgUrl
          })
        } else {
          that.setData({
            skin: res.data
          })
        }
      }
    })
  },
})