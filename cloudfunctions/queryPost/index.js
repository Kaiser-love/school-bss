// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init()

// 云函数入口函数
exports.main = async(event, context) => {
  let {
    index,
    table
  } = event
  let {
    OPENID,
    APPID
  } = cloud.getWXContext() // 这里获取到的 openId 和 appId 是可信的
  const db = cloud.database()
  // 查看用户发表的帖子
  if (index == 0)
    return db.collection(table).where({
        _openid: OPENID
      })
      .orderBy("date", "desc")
      .get()
  // 查看用户收藏的帖子
  else if (index == 1)
    return db.collection('userCollection').where({
        _openid: OPENID
      })
      .orderBy("date", "desc")
      .get()
  else if (index == 2)
    return db.collection('userReply').where({
        _openid: OPENID
      })
      .orderBy("date", "desc")
      .get()
}