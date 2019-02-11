// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init()

// 云函数入口函数
exports.main = async (event, context) => {
  let {
    table,
    query,
    queryString
  } = event
  const db = cloud.database()
  try {
    return db.collection(table).where({
      [query]: queryString
    }).remove()
  } catch (e) {
    console.error(e)
  }
}