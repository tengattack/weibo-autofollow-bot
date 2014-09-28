
var fs = require('fs');
var config = require('./config');
var WeiboWeb = require('./class/weibo_web').WeiboWeb;

var wbweb = new WeiboWeb(config.weibo.WEB_COOKIE);
var user_id = 5048427595;
/*wbweb.unfollow(user_id, function (err, data) {
  console.log(data);
});
wbweb.followed(user_id, function (err, data) {
  console.log(data);
});*/
wbweb.message_add(user_id, '小夜是\r\n萝莉控！', function (err, data) {
  console.log(data);
});