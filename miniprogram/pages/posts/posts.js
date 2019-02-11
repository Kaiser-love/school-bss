// pages/posts/posts.js
const utils = require('../../utils/util.js')
const api = require('../../config/config.js')
const regeneratorRuntime = require('../../libs/runtime.js')
const commonMethod = require("../../utils/common.js")
const app = getApp()
Page({

  /**
   * 页面的初始数据
   */
  data: {
    pageIndex: 0,
    touch_start: '',
    touch_end: '',
    postId:''
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {
    this.data.pageIndex = options.index
    this.setData({
      pageIndex: this.data.pageIndex
    })
    this.refreshPostList(options)
  },
  async refreshPostList(options) {
    // utils.request(api.api.user.postList.url + '/' + options.index).then(function(res){
    //   console.log(res.data)
    //     that.setData({
    //       postList: res.data
    //     })
    // })
    // pageIndex为-1则查询用户发表的帖子
    if (this.data.pageIndex == -1) {
      const result = await app.findPostsAboutQuery('posts', 'subject', options.query)
      this.setData({
        postList: result.data
      })
    } else {
      // 调用云函数查询指定ID的数据（pageIndex为2则查询用户收藏 pageIndex为3则查询用户评论）
      const result = await wx.cloud.callFunction({
        name: 'queryPost',
        data: {
          index: this.data.pageIndex,
          table: 'posts',
        }
      })
      this.setData({
        postList: result.result.data
      })
    }
  },
  //按下事件开始
  mytouchstart: function(e) {
    this.data.touch_start = e.timeStamp
  },
  //按下事件结束
  mytouchend: function(e) {
    this.data.touch_end = e.timeStamp
  },
  editAddress: function(e) {
    var touchTime = this.data.touch_end - this.data.touch_start;
    if (touchTime > 350) {
      //长按
      this.removeAction(e)
    } else {
      //短按
      this.gotoDetail(e)
    }
  },
  gotoDetail(e) {
    var _postid = e.currentTarget.dataset._postid
    var _id = e.currentTarget.dataset._id
    if (_postid)
      app.navigateTo('../detail/detail?index=' + _postid, '帖子详情')
    else
      app.navigateTo('../detail/detail?index=' + _id, '帖子详情')
  },
  removeAction(e) {
    var that = this
    this.data.postId = e.currentTarget.dataset._postid
    if (this.data.pageIndex == 0 || this.data.pageIndex == 1 || this.data.pageIndex == 2) {
      app.showTips('删除', '是否继续删除', res => {
        if (res.confirm) {
          // 删除我发表的指定ID的帖子
          if (that.data.pageIndex == 0) {
            app.removeById('posts', e.currentTarget.dataset._id).then(res => app.showToast('删除成功', 'success', '1')).catch(err => app.showToast('删除失败'), 'error', '1')
            that.refreshPostList(e)
          }
          // 删除我收藏的指定ID的帖子
          else if (that.data.pageIndex == 1) {
            app.removeById('userCollection', e.currentTarget.dataset._id).then(res => app.showToast('删除成功', 'success', '1')).catch(err => app.showToast('删除失败'), 'error', '1')
            app.downByCondition('posts', '_id', that.data.postId, 'loveNum')
            that.refreshPostList(e)
          }
            // 删除我评论过的帖子
          else if (that.data.pageIndex == 2){
            app.removeById('userReply', e.currentTarget.dataset._id).then(res => app.showToast('删除成功', 'success', '1')).catch(err => app.showToast('删除失败'), 'error', '1')
            that.refreshPostList(e)
          }
        }
      })
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