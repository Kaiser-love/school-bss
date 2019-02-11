// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init()

// 云函数入口函数
exports.main = async (event, context) => {
  let { data, table } = event
  let { OPENID, APPID } = cloud.getWXContext() // 这里获取到的 openId 和 appId 是可信的
  return cloud.database().collection(table).where({
      postId: data.postId
    })
    .update({
      data: data
    })
  }