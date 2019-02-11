// pages/send/send.js
const api = require('../../config/config.js')
const utils = require('../../utils/util.js')
const app = getApp()
const regeneratorRuntime = require('../../libs/runtime.js')
Page({
  /**
   * 页面的初始数据
   */
  data: {
    focus: false,
    inputValue: '',
    isAnonymous: false,
    device: '',
    location: '',
    title: "标题",
    array: ['就业实习','社团协会', '二手交易', '有求必应', '社团协会', '家教兼职'],
    index: 0,
    errorMessage: ['请选择分类', '请输入标题', '请输入电话号码', '请输入内容'],
    images: [],
    imageList: []
  },
  bindPickerChange: function(e) {
    this.setData({
      index: e.detail.value
    })
  },
  bindFormSubmit: function(e) {
    if (this.checkError(e)) return
    this.uploadImages(e)
  },
  checkError(e) {
    var errorIndex = -1;
    if (!this.data.array[this.data.index])
      errorIndex = 0;
    else if (!e.detail.value.title)
      errorIndex = 1;
    else if (!e.detail.value.phoneNumber)
      errorIndex = 2;
    else if (!e.detail.value.textarea)
      errorIndex = 3;
    if (errorIndex != -1) {
      app.showToast(this.data.errorMessage[errorIndex], 'error', 1)
      return true;
    }
  },
  sendPostRequest(e) {
    var that = this
    var postData = {
      subject: e.detail.value.title,
      type: this.data.array[this.data.index],
      content: e.detail.value.textarea,
      phoneNumber: e.detail.value.phoneNumber,
      date: new Date().getTime(),
      author: this.data.isAnonymous ? app.randomText(true) : app.globalData.userInfo.nickName,
      avatarUrl: this.data.isAnonymous ? 'https://7465-test-183339-1257996776.tcb.qcloud.la/静态图片/timg.jpg?sign=f0a914bfaa5bde8ae051a82a1c383464&t=1545123879':app.globalData.userInfo.avatarUrl,
      device: this.data.device,
      location: this.data.location,
      images: this.data.imageList,
      loveNum: 0,
      lookNum: 0,
      replyNum: 0,
      _openid: app.globalData.openid,
      school: e.detail.value.school
    }
    // utils.request(api.api.user.send.url, postData, api.api.user.send.method).then(function (res) {
    //   if (res.code == 0) {
    //     app.showToast('发表成功！', 'success', 1)
    //     app.waitSomeTime(1000, that.callback)
    //   }
    //   else
    //     app.showToast('发表失败！', 'error', 1)
    // })
    // 小程序调用
    app.addItem('posts', postData).then(
      res => {
        app.showToast('发表成功！', 'success', 1)
        app.waitSomeTime(400, that.callback)
      }
    )
  },
  callback: function() {
    wx.navigateBack({})
  },
  //获取用户上传的图片
  chooseImage() {
    var that = this
    wx.chooseImage({
      count: 9 - this.data.images.length,
      sizeType: 'compressed',
      success(res) {
        // tempFilePath可以作为img标签的src属性显示图片
        const tempFilePaths = res.tempFilePaths
        that.data.images.push(...tempFilePaths)
        that.setData({
          images: that.data.images
        })
      }
    })
  },
  //删除用户上传的图片
  deleteImage(e) {
    this.data.images.splice(e.currentTarget.datasetidx, 1)
    this.setData({
      images: this.data.images
    })
  },

  //获取地理位置
  chooseLocation() {
    var that = this
    wx.chooseLocation({
      success: function(res) {
        that.data.location = res.name
        that.setData({
          location: that.data.location
        })
      },
    })
  },
  removeLocation() {
    this.data.location = ''
    this.setData({
      location: this.data.location
    })
  },
  anonymousChange() {
    this.data.isAnonymous = !this.data.isAnonymous
    this.setData({
      isAnonymous: this.data.isAnonymous
    })
  },
  async uploadImages(e) {
    var fileIdList = []
    var imageList = []
    for (var image of this.data.images) {
     // 将文件上传到云服务器
      const res = await wx.cloud.uploadFile({
        cloudPath: `${app.globalData.userInfo.nickName}` + '/' + Math.random().toString(36).substr(2, 15) + image.substring(image.length - 4, image.length),
        filePath: image, // 小程序临时文件路径
      })
      // const res = await app.uploadImage(`${app.globalData.userInfo.nickName}` + '/' + Math.random().toString(36).substr(2, 15) + image.substring(image.length - 4, image.length), image)
      fileIdList.push(res.fileID)
    }
    // 获得真实的图片URL
    const res = await wx.cloud.getTempFileURL({
      fileList: fileIdList,
    })
    console.log(res)
    for (var image of res.fileList)
      imageList.push(image.tempFileURL)
    if (imageList.length == 0)
      imageList.push("https://7465-test-183339-1257996776.tcb.qcloud.la/静态图片/tooopen_sy_175866434296.jpg?sign=0cfda0d01019b02f08720d41d7d1571c&t=1545104925")
    this.data.imageList = imageList
    this.sendPostRequest(e)
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {},

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function() {

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function() {
    var model = wx.getSystemInfoSync().model
    this.data.device = model.replace(/<.*>/, '')
  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function() {},

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function() {},

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