var app = getApp();
Page({
  data: {
    list: [],
    subcount: {},
    loading: true
  },
  onLoad: function() {
  },
  onShow: function() {
    console.log("me show----------")
  },
  commentlike(e){
    console.log(e)
  }
})