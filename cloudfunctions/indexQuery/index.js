// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init()

// 云函数入口函数
exports.main = async (event, context) => {
  const wxContext = cloud.getWXContext()
  const db = cloud.database()

  // 查询小记列表页
  return new Promise((resolve, reject) => {
    db.collection('notes').where({
      _openid: event._openid
    }).get().then(res => {
      if (res.errMsg === 'collection.get:ok') {
        resolve(res.data);
      }
    })
  })
}