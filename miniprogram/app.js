//app.js
const api = require('./config/config.js')
const utils = require('./utils/util.js')
const regeneratorRuntime = require('./libs/runtime.js')
const nameCreate = require('./constant/nameCreate.js')
const {
  $Toast
} = require('./dist/base/index')
App({
  onLaunch: function() {
    // 初始化云函数
    if (!wx.cloud) {
      console.error('请使用 2.2.3 或以上的基础库以使用云能力')
    } else {
      wx.cloud.init({
        traceUser: true,
      })
    }
    // 保存openid
    this.randomText()
    this.getOpenId()
    // 登录
    this.getUserInfo()
    this.globalData.$Toast = $Toast
    //console.log(this.globalData.userInfo)
  },
  getUserInfo: function(cb) {
    var that = this
    if (this.globalData.userInfo)
      typeof cb == "function" && cb(this.globalData.userInfo)
    else {
      //调用登录接口
      wx.login({
        success: function(res) {
          var code = res.code
          wx.getUserInfo({
            success: function(res) {
              // var nickName = res.userInfo.nickName
              // var gender = res.userInfo.gender
              // var avatarUrl = res.userInfo.avatarUrl
              // var postData = {
              //   code,
              //   nickName,
              //   gender,
              //   avatarUrl
              // }
              // utils.request(api.api.user.login.url, postData, api.api.user.login.method).then(function(res) {
              //   if (res.code == 0) {
              //     wx.setStorageSync("token", res.data.token)
              //     wx.setStorageSync("openid", res.data.openid)
              //   } else
              //     that.showTips("提示", "获取用户信息失败，请关闭重新进入")
              // })
              that.globalData.userInfo = res.userInfo
              var app = getApp()
              // console.log(`(${app.globalData.userInfo.nickName})`)
              console.log(app.globalData.userInfo)
              typeof cb == "function" && cb(that.globalData.userInfo)
            },
            fail: res => {
              that.showTips('警告', '尚未进行授权，请点击确定跳转到授权页面进行授权。', res => {
                if (res.confirm) {
                  wx.navigateTo({
                    url: '/pages/tologin/tologin',
                  })
                }
              })
            }
          })
        }
      })
    }
  },
  showTips(subject, content, callback) {
    return wx.showModal({
      title: subject,
      content: content,
      success: callback
    })
  },
  showToast(content, type, duration = '0') {
    $Toast({
      content: content,
      type: type,
      duration: duration
    })
  },
  waitSomeTime(duration, callback) {
    setTimeout(callback, duration)
  },
  navigateTo(url, title) {
    wx.navigateTo({
      url: url,
      success: function() {
        wx.setNavigationBarTitle({
          title: title,
        })
        wx.showNavigationBarLoading();
        setTimeout(function() {
          wx.hideNavigationBarLoading();
        }, 500)
      }
    })
  },
  // --------------数据库操作----------------
  // 数据库新增记录
  addItem(table, data, flag = true) {
    if (data.postId && !flag) {
      // 调用云函数查询指定ID的数据
      return wx.cloud.callFunction({
        name: 'update',
        data: {
          data: data,
          table: table,
        }
      })
    }
    // return wx.cloud.database().collection(table).add({
    //   data: data,
    // })
    return wx.cloud.callFunction({
      name: 'addItemByConditon',
      data: {
        table: table,
        data: data,
      }
    })
  },
  // 根据id查询帖子具体信息
  getpostById(table, index) {
    return wx.cloud.database().collection(table).doc(index).get()
  },
  // 将帖子为ID的帖子的lookNum加1
  addpostNumById(table, index, description) {
    // var db = wx.cloud.database()
    // const _ = db.command
    // return db.collection(table).doc(index).update({
    //   data: {
    //     [description]: _.inc(1)
    //   }
    // })
    return wx.cloud.callFunction({
      // 云函数名称
      name: 'addByCondition',
      // 传给云函数的参数
      data: {
        table: table,
        query: '_id',
        queryString: index,
        description: description
      },
    })
  },
  downByCondition(table, query, queryString, description) {
    return wx.cloud.callFunction({
      // 云函数名称
      name: 'downByCondition',
      // 传给云函数的参数
      data: {
        table: table,
        query: query,
        queryString: queryString,
        description: description
      },
    })
  },
  // 获取分页数据
  getpostByStartAndCount(table, start, count, sortConditon, type, openid) {
    if (start == 0) {
      if (sortConditon != null)
        return wx.cloud.database().collection(table)
          .orderBy(sortConditon, 'desc')
          .limit(count)
          .get()
      else
        return wx.cloud.database().collection(table)
          .where({
            type: type
          })
          .limit(count)
          .orderBy('date', 'desc')
          .get()
    } else {
      if (sortConditon != null)
        return wx.cloud.database().collection(table)
          .orderBy(sortConditon, 'desc')
          .skip(start)
          .limit(count)
          .get()
      else
        return wx.cloud.database().collection(table)
          .where({
            type: type
          })
          .skip(start)
          .limit(count)
          .orderBy('date', 'desc')
          .get()
    }
  },
  //根据帖子ID查看帖子下的所有评论
  getReplyByPostId(table, postId) {
    return wx.cloud.database().collection(table)
      .where({
        postId: postId
      })
      .get()
  },
  // 根据云函数获得Openid
  getOpenId() {
    var that = this
    // 调用云函数查询指定ID的数据
    wx.cloud.callFunction({
      name: 'login',
    }).then(res => that.globalData.openid = res.result.userInfo.openId)
  },
  // 根据字段进行模糊查询
  findPostsAboutQuery(table, description, query) {
    var db = wx.cloud.database()
    return db.collection(table).where({
        [description]: db.RegExp({
          regexp: '.*?' + query + '.*?',
          options: 'i',
        })
      })
      .orderBy('date', 'desc')
      .get()
  },
  // 根据ID删除
  removeById(table, id) {
    return wx.cloud.database().collection(table).doc(id).remove()
  },
  // 根据条件删除
  removeByCondition(table, query, queryString) {
    return wx.cloud.database().collection(table)
      .where({
        [query]: queryString
      })
      .remove()
  },
  // 根据帖子ID和用户openid判断帖子是否被收藏
  isCollect(table, id, openid) {
    return wx.cloud.database()
      .collection(table)
      .where({
        postId: id,
        _openid: openid
      })
      .get()
  },
  // 发表图片
  uploadImage(cloudPath, filePath) {
    return wx.cloud.callFunction({
      // 云函数名称
      name: 'uploadImage',
      // 传给云函数的参数
      data: {
        cloudPath,
        filePath
      },
    })
  },
  // 随机生成名字
  randomText(flag, id) {
    var nameData = nameCreate.nameData
    var newname = nameData[parseInt(Math.random() * nameData.length)]
    // 发表帖子的匿名
    if (flag)
      return newname
    // 评论帖子的匿名，判断是否为同一帖子
    var nameAndId = wx.getStorageSync('name'+id) || [];
    if (nameAndId.length == 0) {
      wx.setStorageSync('name'+id, newname)
      return newname
    } else {
      return wx.getStorageSync('name' + id)
    }
  },
  //app.globalData.openid
  //globalData.$Toast
  globalData: {
    userInfo: null,
    openid: '',
    $Toast
  }
})