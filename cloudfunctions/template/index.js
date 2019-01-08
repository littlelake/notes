// 云函数入口文件
const cloud = require('wx-server-sdk');
const got = require('got');
// 输入自己的APPID和SECRET
const reptileUrl = "https://api.weixin.qq.com/cgi-bin/token?grant_type=client_credential&appid=wx991971ce64d542dc&secret=84d8874577b8c7481a7c91bac02a457d";
// 分别填入appid和secret
const MessageUrl = "https://api.weixin.qq.com/cgi-bin/message/wxopen/template/send?access_token=";

cloud.init();

// 云函数入口函数
exports.main = async (event, context) => {
  let data = JSON.stringify({
    touser: event.openid,
    template_id: event.template_id,
    page: event.page,
    form_id: event.form_id,
    data: JSON.parse(event.data),
    emphasis_keyword: event.emphasis_keyword
  });

  let http = await got(reptileUrl);
  let access_token = JSON.parse(http.body).access_token;
  let Message = await got(MessageUrl + access_token, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: data
  })
  
  return Message.body
}