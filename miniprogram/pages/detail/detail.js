// pages/detail/detail.js
const api = require('../../config/config.js')
const utils = require('../../utils/util.js')
const regeneratorRuntime = require('../../libs/runtime.js')
const app = getApp()
Page({
  /**
   * 页面的初始数据
   */
  data: {
    detailMessage: [],
    postId: '',
    sendOpenId: '',
    subject: '',
    replyList: [],
    //发表按钮所需变量
    loading: false,
    placeholder: '写点评论...',
    focusComment: false,
    content: '',
    isAnonymous: false,
    replyTo: '',
    inputContent: '',
    isFilmFavorite: false,
    replyList:[]
  },

  /**
   * 生命周期函数--监听页面加载
   */
  async onLoad(options) {
    getApp().showToast('加载中', 'loading')
    // 判断是否收藏
    var that = this
    this.data.postId = options.index
    // 将浏览数加1
    await app.addpostNumById('posts', options.index, 'lookNum')
    // 获取详情数据
    const detailMessage = await app.getpostById('posts', options.index)
    this.data.detailMessage = detailMessage.data
    this.data.detailMessage.isDtail = true
    this.data.sendOpenId = detailMessage.data._openid
    // 判断是否收藏
    const isCollect = await app.isCollect("userCollection", that.data.detailMessage._id, app.globalData.openid)
    this.data.isFilmFavorite = isCollect.data.length == 0 ? false : true
    this.setData({
      detailMessage: this.data.detailMessage,
      isFilmFavorite: this.data.isFilmFavorite
    })
    await this.refreshComment()
    app.globalData.$Toast.hide()
  },
  collectPost() {
    var that = this
    var postData = {
      postId: this.data.postId,
      subject: this.data.detailMessage.subject,
      author: this.data.detailMessage.author,
      date: Date.parse(new Date()),
      type: this.data.detailMessage.type,
      _openid: app.globalData.openid,
      avatarUrl: this.data.detailMessage.avatarUrl
    }
    if (this.data.isFilmFavorite) {
      wx.cloud.callFunction({
          // 云函数名称
          name: 'removeByCondition',
          // 传给云函数的参数
          data: {
            table: 'userCollection',
            query: 'postId',
            queryString: that.data.postId
          },
        })
        .then(res => {
          if (res.result != null) {
            app.downByCondition('posts', '_id', that.data.postId, 'loveNum')
            //更新页面数据
            that.data.detailMessage.loveNum = that.data.detailMessage.loveNum - 1
            that.setData({
              detailMessage: that.data.detailMessage,
              isFilmFavorite: false
            })
            app.showToast('取消收藏成功', 'success', 1)
          }
        })
    } else {
      app.addItem('userCollection', postData).then(
        res => {
          app.showToast('收藏成功！！', 'success', 1)
          // 将收藏数加1
          app.addpostNumById('posts', that.data.postId, 'loveNum')
          //更新页面数据
          that.data.detailMessage.loveNum = that.data.detailMessage.loveNum + 1
          that.setData({
            detailMessage: that.data.detailMessage,
            isFilmFavorite: true
          })
        })
    }
  },
  addItem(table, postData, successMsg, failMsg, otherMsg, postId) {
    var that = this
    app.addItem(table, postData, false).then(
      res => {
        if (res.result.stats.updated == 0) {
          app.addItem(table, postData).then(
            res => {
              if (res._id != null && successMsg) {
                app.showToast(successMsg, 'success', 1)
                if (postId) { // 将收藏数加1
                  app.addpostNumById('posts', postId, 'loveNum')
                  //更新页面数据
                  that.data.detailMessage.loveNum = that.data.detailMessage.loveNum + 1
                  that.setData({
                    detailMessage: that.data.detailMessage,
                    isFilmFavorite: true
                  })
                }
              } else if (failMsg) app.showToast(failMsg, 'error', 1)
            })
        } else if (otherMsg) app.showToast(otherMsg, 'error', 1)
      })
  },
  refreshComment(isAgree) {
    var that = this
    // 加载评论
    app.getReplyByPostId('replyPost', this.data.postId).then(
      res => {
        that.data.replyList = res.data
        var cookie_mid = wx.getStorageSync('zan') || [] //获取全部点赞的cid  
        that.data.replyList = res.data
        for (let i in that.data.replyList) {
          if (cookie_mid.includes(that.data.replyList[i]._id))
            that.data.replyList[i].isAgree = true;
          else
            that.data.replyList[i].isAgree = false;
        }
        that.setData({
          replyList: res.data
        })
      }
    )
  },
  // 评论
  sendReply() {
    var that = this
    var author
    var sourceAvatar = app.globalData.userInfo.avatarUrl
    if (this.data.sendOpenId == app.globalData.openid && !this.data.isAnonymous)
      author = app.globalData.userInfo.nickName + '（作者）'
    else if (this.data.isAnonymous) {
      author = app.randomText(false, this.data.postId)
      sourceAvatar = "https://7465-test-183339-1257996776.tcb.qcloud.la/静态图片/timg.jpg?sign=f0a914bfaa5bde8ae051a82a1c383464&t=1545123879"
    } else
      author = app.globalData.userInfo.nickName
    var postData = {
      postId: this.data.postId,
      content: this.data.content,
      sourceName: author,
      sourceAvatar: sourceAvatar,
      loveNum: 0,
      date: Date.parse(new Date()),
      _openid: app.globalData.openid,
    }
    app.addItem('replyPost', postData).then(
      res => {
        app.showToast('评论成功！', 'success', 1)
        that.refreshComment()
      }
    )
    // 将用户评论的帖子和用户关联起来
    this.addUserReply()
    // 帖子评论数加1
    app.addpostNumById('posts', this.data.postId, 'replyNum')
  },
  addUserReply() {
    var postData = {
      postId: this.data.postId,
      type: this.data.detailMessage.type,
      subject: this.data.detailMessage.subject,
      author: this.data.detailMessage.author,
      date: Date.parse(new Date()),
      comment: this.data.content,
      _openid: app.globalData.openid,
      avatarUrl: this.data.detailMessage.avatarUrl
    }
    this.addItem('userReply', postData)
  },
  showAction: function(e) {
    var sourcename = e.currentTarget.dataset.sourcename
    var commentId = e.currentTarget.dataset._id
    this.data.replyTo = e.currentTarget.dataset._openid
    const itemList = [`回复 ${sourcename}:`]
    if (this.data.replyTo == app.globalData.openid)
      itemList.push('删除')
    var that = this
    try {
      wx.showActionSheet({
        itemList,
        success: res => {
          if (res.tapIndex == 0) {
            //this.data.replyTo = _openid
            that.setData({
              inputContent: '回复 ' + sourcename + '：',
              focusComment: true
            })
          } else if (res.tapIndex == 1) {
            app.removeById('replyPost', commentId).then(
              res => {
                app.showToast('删除成功', 'success', 1)
                //重新加载评论
                this.refreshComment()
              }
            )
            // 评论数减1
            app.downByCondition('posts', '_id', that.data.postId, 'replyNum')
          }
        }
      })
    } catch (e) {}
  },
  // 评论按钮
  /**
   * 输入监听器
   * 自动映射到 content
   * @param {Event} e 输入事件
   */
  inputChange(e) {
    this.data.content = e.detail.value
    this.data.disable = e.detail.value === ''
  },

  /**
   * 输入框聚焦
   */
  inputFocus() {
    this.setData({
      focusComment: true
    })
  },

  /**
   * 输入框失去焦点
   */
  inputBlur() {
    this.setData({
      focusComment: false
    })
  },

  inputConfirm() {
    this.sendReply()
    // init input
    this.data.content = ''
    this.data.inputContent = ''
    this.data.focusComment = false
    this.setData({
      inputContent: ''
    })
    this.refreshComment()
  },

  /**
   * 切换实名、匿名
   */
  anonymousChange() {
    this.data.isAnonymous = !this.data.isAnonymous
    this.setData({
      isAnonymous: this.data.isAnonymous
    })
  },
  commentlike(e) {
    var that = this
    // 当前评论id
    var cid = e.currentTarget.dataset.cid
    var cookie_mid = wx.getStorageSync('zan') || [] //获取全部点赞的cid  
    var newmessage = []
    if (cookie_mid.includes(cid)) { //说明已经点过赞,取消赞  
      var m = 0;
      for (var j in cookie_mid) {
        if (cookie_mid[j] != cid) {
          newmessage[m] = cookie_mid[j];
          m++
        }
      }
      // 点赞数减1
      app.downByCondition('replyPost', '_id', e.currentTarget.dataset.cid, 'loveNum').then(
        res => {
          for (let i in that.data.replyList) {
            if (that.data.replyList[i]._id == e.currentTarget.dataset.cid) {
              that.data.replyList[i].loveNum = that.data.replyList[i].loveNum - 1
              that.data.replyList[i].isAgree = false
              break
            }
          }
          that.setData({
            replyList: that.data.replyList
          })
        }
      )
      wx.setStorageSync('zan', newmessage); //删除取消赞的cid  
    } else {
      cookie_mid.unshift(cid);
      wx.setStorageSync('zan', cookie_mid); //新增赞的cid 
      // 点赞数加1
      app.addpostNumById('replyPost', e.currentTarget.dataset.cid, 'loveNum').then(
        res => {
          for (let i in that.data.replyList) {
            if (that.data.replyList[i]._id == e.currentTarget.dataset.cid){
              that.data.replyList[i].loveNum = that.data.replyList[i].loveNum + 1
              that.data.replyList[i].isAgree = true
              break
            }
          }
          that.setData({
            replyList: that.data.replyList
          })
        }
      )
    }
  },
  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function() {

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function() {

  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function() {

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function() {

  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function() {

  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function() {

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function() {

  }
})