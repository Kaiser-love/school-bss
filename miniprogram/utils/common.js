const util = require('util.js');
const app = getApp()
const isFirst = false
// 滚动切换标签样式
function switchTab(that, e) {
  that.setData({
    currentTab: e.detail.current
  });
  that.checkCor();
}

function handleChange(that, detail) {
  that.setData({
    currentTab: detail.key
  })
  that.refreshMore();
}
// 点击标题切换当前页时改变样式
//判断当前滚动超过一屏时，设置tab标题滚动条。
function checkCor(that) {
  wx.pageScrollTo({
    scrollTop: 0
  })
  that.refreshMore();
  if (that.data.currentTab > 4) {
    that.setData({
      scrollLeft: 300
    })
  } else {
    that.setData({
      scrollLeft: 0
    })
  }
}
//跳转到详情页
function navigateDetail(that, event) {
  wx.navigateTo({
    url: '../detail/detail?index='.concat(event.currentTarget.dataset.itemid) + "&tabs=" + that.data.currentTab,
    success: function () {
      wx.setNavigationBarTitle({
        title: '详情页',
      })
      wx.showNavigationBarLoading();
      setTimeout(function () {
        wx.hideNavigationBarLoading();
      }, 800)
    }
  })
}
// 加载更多api.IndexUrl
function laodMore(that, type, url) {
  // var nexUrl = url + '?start=' + that.data.totalcount + '&count=6' + "&tabs=" + that.data.currentTab;
  // util.request(nexUrl).then(function(res) {
  //   if (res.numberOfElements === 0 || !res) {
  //     that2.setData({
  //       hasNext: false
  //     })
  //     return
  //   }
  //   var totalNews = that.data.newsList.concat(res.content)
  //   that2.setData({
  //     newsList: totalNews,
  //   });
  // });
  if (!that.data.hasNext) {
    console.log("failed return ");
    return
  }
  var newsList = []
  var sortConditon = null;
  if (type == '深大最新') sortConditon = 'date'
  else if (type == '深大最热') sortConditon = 'lookNum'
  app.getpostByStartAndCount('posts', that.data.totalcount, 6, sortConditon,type).then(
    res => {
      if (res.data.length==0){
        that.setData({ hasNext: false })
        return
      }
       var totalNews = that.data.newsList.concat(res.data)
       that.setData({ newsList: totalNews })
    }
  )
  that.data.totalcount += 6;
}

function refreshMore(that) {
  that.data.totalcount = 0;
  that.setData({
    newsList: []
  })
  that.setData({
    hasNext: true
  })
  that.laodMore();
}

function addArticle() {
  getApp().navigateTo('../send/send', '发帖页')
}

function fitScreen(that) {
  //  高度自适应
  var that2 = that;
  wx.getSystemInfo({
    success: function (res) {
      var clientHeight = res.windowHeight,
        clientWidth = res.windowWidth,
        rpxR = 750 / clientWidth;
      var calc = clientHeight * rpxR - 180;
      that2.setData({
        winHeight: calc
      });
    }
  });
}

function laodDetail(that, url) {
  let that2 = that;
  util.request(url).then(function (res) {
    console.log(res)
    that2.setData({
      detailMessage: res
    })
  });
}

function http(url, method, callback) {
  util.request(url, {}, method).then(function (res) {
    if (res == "successful")
      callback(res)
  });
}
module.exports = {
  switchTab,
  handleChange,
  checkCor,
  navigateDetail,
  laodMore,
  refreshMore,
  addArticle,
  fitScreen,
  laodDetail,
  http
}