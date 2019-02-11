// 云函数入口文件
const cloud = require('wx-server-sdk')
const fs = require('fs')
const path = require('path')
cloud.init()

// 云函数入口函数
exports.main = async (event, context) => {
  let {
      cloudPath,
      filePath
  } = event
  const fileStream = fs.createReadStream(path.join(__dirname, filePath))
  return await cloud.uploadFile({
    cloudPath: cloudPath,
    fileContent: fileStream,
  })
}