var app = getApp();
const api = require('../../config/api.js');
var commonMethod = require("../../utils/common.js");
const { $Toast } = require('../../dist/base/index');
Page({
  data: {
    winHeight: "", //窗口高度
    currentTab: 0, //预设当前项的值
    scrollLeft: 0, //tab标题的滚动条位置
    newsList: [],
    totalcount: 0,
    hasNext:true,
    tabs: ['良心家教', '就业实习', '二手交易','有求必应']
  },
  // 滚动切换标签样式
  switchTab: function (e) {
    commonMethod.switchTab(this, e)
  },

  handleChange({ detail }) {
    commonMethod.handleChange(this, detail)
  },
  // 点击标题切换当前页时改变样式
  //判断当前滚动超过一屏时，设置tab标题滚动条。
  checkCor: function () {
    commonMethod.checkCor(this)
  },
  //跳转到详情页
  navigateDetail: function (event) {
    commonMethod.navigateDetail(this, event)
  },
  // 加载更多
  laodMore: function (res) {
    app.showToast("加载中", 'loading')
    commonMethod.laodMore(this, this.data.tabs[this.data.currentTab], api.IndexUrl)
    app.globalData.$Toast.hide()
  },
  refreshMore: function () {
    commonMethod.refreshMore(this)
  },
  addArticle: function () {
    commonMethod.addArticle(this)
  },
  onSearch(e){
    app.navigateTo('../posts/posts?index=' + '-1'+'&query='+e.detail, '帖子信息')
    this.setData({
      inputvalue:''
    })
  },
  onLoad: function () {
    this.laodMore();
    commonMethod.fitScreen(this);
  },
  /**
 * 生命周期函数--监听页面显示
 */
  onShow: function () {
  },
})