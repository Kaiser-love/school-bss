var app = getApp();
const api = require('../../config/api.js');
//const constant = require('../../constant/constant.js');
const {
  $Toast
} = require('../../dist/base/index');
var commonMethod = require("../../utils/common.js")
Page({
  data: {
    winHeight: "", //窗口高度
    currentTab: 0, //预设当前项的值
    scrollLeft: 0, //tab标题的滚动条位置
    newsList: [],
    totalcount: 0,
    hasNext: true, //是否有下页
    imgUrls: [
      'https://7465-test-183339-1257996776.tcb.qcloud.la/静态图片/tooopen_sy_143912755726.jpg?sign=3dcb21bd572aa37f1e7a836c1e954491&t=1545071130',
      'https://7465-test-183339-1257996776.tcb.qcloud.la/静态图片/tooopen_sy_175833047715.jpg?sign=0b80a773b7bf428808a7173f5ab5f377&t=1545071157',
      'https://7465-test-183339-1257996776.tcb.qcloud.la/静态图片/tooopen_sy_175866434296.jpg?sign=35397e51bcdc05337d1f3c0147892bdb&t=1545071168'
    ],
    img: [
      'https://7465-test-183339-1257996776.tcb.qcloud.la/静态图片/tooopen_sy_143912755726.jpg?sign=3dcb21bd572aa37f1e7a836c1e954491&t=1545071130',
      'https://7465-test-183339-1257996776.tcb.qcloud.la/静态图片/tooopen_sy_175833047715.jpg?sign=0b80a773b7bf428808a7173f5ab5f377&t=1545071157',
      'https://7465-test-183339-1257996776.tcb.qcloud.la/静态图片/tooopen_sy_175866434296.jpg?sign=35397e51bcdc05337d1f3c0147892bdb&t=1545071168',    'https://wx.qlogo.cn/mmopen/vi_32/kuRicCbWhUmg0ezS898737Fx8C2U053elBTzYWugRmPibtyRLRDhH6lnnIeBquuuEicuEXaXxVicoRNmCWEbEBQfaA/132'
    ],
    contentItems: ['', '', '', ''],
    tabs: ['深大推荐', '深大最新', '深大最热']
  },
  // 滚动切换标签样式
  switchTab: function(e) {
    commonMethod.switchTab(this, e)
  },

  handleChange({
    detail
  }) {
    commonMethod.handleChange(this, detail)
  },
  // 点击标题切换当前页时改变样式
  //判断当前滚动超过一屏时，设置tab标题滚动条。
  checkCor: function() {
    commonMethod.checkCor(this)
  },
  //跳转到详情页
  navigateDetail: function(event) {
    commonMethod.navigateDetail(this, event)
  },
  // 加载更多
  laodMore: function(res) {
    app.showToast("加载中", 'loading')
    commonMethod.laodMore(this, this.data.tabs[this.data.currentTab], api.IndexUrl)
    app.globalData.$Toast.hide()
  },
  refreshMore: function() {
    commonMethod.refreshMore(this)
  },
  addArticle: function() {
    commonMethod.addArticle()
  },
  onLoad: function() {
    // console.log(constant.constant.user)
    commonMethod.fitScreen(this);
    // 获取最新公告
    var that = this
    app.getpostByStartAndCount('notice', 0, 3, 'date').then(res => {
      that.setData({
        notice: res.data[0].notice + '  ' + res.data[1].notice + '  ' + res.data[2].notice
      })
    })
    // commonMethod.laodMore(this)
  },
  onShow: function() {
    //commonMethod.refreshMore(this)
  },
})