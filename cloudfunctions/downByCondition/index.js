// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init()

// 云函数入口函数
exports.main = async (event, context) => {
  let {
    table,
    query,
    queryString,
    description
  } = event
  const db = cloud.database()
  const _ = db.command
  try {
    return db.collection(table).where({
      [query]: queryString
    }).update({
      data: {
        [description]: _.inc(-1)
      }
    })
  } catch (e) {
    console.error(e)
  }
}