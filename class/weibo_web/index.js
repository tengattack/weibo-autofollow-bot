
var request = require('request');
var _ = require('underscore');

function WeiboWeb(cookies, opt) {
  this.reqopts = {
    headers: {
      'Referer': 'http://weibo.com/tengattack/home',
      'Cookie': cookies
    }
  };
}

WeiboWeb.prototype.url = function (api) {
  return 'http://weibo.com/' + api + '?_wv=5&__rnd=' + (new Date().valueOf());
};

WeiboWeb.prototype.request = function (api, paras, callback) {
  var reqopts = _.clone(this.reqopts);
  reqopts.url = this.url(api);
  reqopts.form = paras;
  request.post(reqopts, function (error, response, body) {
    if (!error) {
      if (body) {
        try {
          var json_body = JSON.parse(body);
          var code = parseInt(json_body.code);
          if (code != 100000) {
            callback(json_body);
          } else {
            callback(null, json_body);
          }
        } catch (e) {
          callback(e);
        }
      } else {
        callback({err: 'no body'});
      }
    } else {
      callback(error);
    }
  });
};

WeiboWeb.prototype.followed = function (uid, callback) {
  var form = {
    uid: uid,
    f: 1,
    location: 'page_100505_home',
    wforce: 1,
    refer_sort: 'profile',
    refer_flag: 'profile_head',
    _t: 0
  };
  this.request('aj/f/followed', form, callback);
};

WeiboWeb.prototype.unfollow = function (uid, callback) {
  var form = {
    uid: uid,
    f: 1,
    location: 'page_100505_home',
    wforce: 1,
    refer_sort: 'profile',
    refer_flag: 'profile_head',
    _t: 0
  };
  this.request('aj/f/unfollow', form, callback);
};

WeiboWeb.prototype.message_add = function (uid, text, callback) {
  var form = {
    text: text,
    //screen_name: screen_name,
    uid: uid,
    id: 0,
    fids: '',
    touid: 0,
    style_id: 1,
    location: 'myfans',
    module: 'msglayout',
  };
  this.request('aj/message/add', form, callback);
};

exports.WeiboWeb = WeiboWeb;