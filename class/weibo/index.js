
var request = require('request');
var _ = require('underscore');

var WeiboAccount = require('./account').WeiboAccount;
var WeiboFriendships = require('./friendships').WeiboFriendships;
var WeiboRemind = require('./remind').WeiboRemind;
var WeiboStatuses = require('./statuses').WeiboStatuses;
var WeiboUsers = require('./users').WeiboUsers;

function Weibo(conf_weibo, opt) {
  this.opt = opt ? opt : {};
  this.conf = conf_weibo;
  this.app_key = conf_weibo.APP_KEY;
  this.app_secret = conf_weibo.APP_SECRET;
  this.redirect_uri = conf_weibo.REDIRECT_URI;
  this.access_token = conf_weibo.ACCESS_TOKEN;

  this._account = new WeiboAccount(this);
  this._friendships = new WeiboFriendships(this);
  this._remind = new WeiboRemind(this);
  this._statuses = new WeiboStatuses(this);
  this._users = new WeiboUsers(this);
}

Weibo.prototype.oauth2_access_token = function (auth_code) {
  request
    .post(this.urlex('oauth2/access_token'), 
    {
      form: {
        client_id: this.app_key,
        client_secret: this.app_secret,
        grant_type: 'authorization_code',
        code: auth_code,
        redirect_uri: this.redirect_uri
    }}, function (error, response, body) {
      console.log(error, response.statusCode, body);
    });
};

Weibo.prototype.oauth2_authorize = function () {
  window.location.href = (this.urlex('oauth2/authorize', {
    client_id: this.app_key,
    redirect_uri: this.redirect_uri,
    response_type: 'code'
  }));
};

Weibo.prototype.urlex = function (api, paras) {
  var url = 'https://api.weibo.com/' + api;
  var count = 0;
  for (var key in paras) {
    url += ((count > 0) ? '&' : '?') + key + '=' + paras[key];
    count++;
  }
  return url;
};

Weibo.prototype.url = function (api, paras) {
  var _paras = paras ? _.clone(paras) : {};
  _paras.source = this.app_key;
  _paras.access_token = this.access_token;
  return this.urlex(api, _paras);
};

Weibo.prototype.request = function(api, paras, callback) {
  if (paras instanceof Function) {
    callback = paras;
    paras = null;
  }
  request(this.url(api, paras), function (error, response, body) {
    if (!error) {
      if (body) {
        try {
          var json_body = JSON.parse(body);
          if (json_body.error) {
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

Weibo.prototype.init = function(callback) {
  var that = this;
  this.account().get_uid(function (err, data) {
    if (err) {
      callback(err);
      return;
    }
    that.uid = data.uid;
    callback();
  });
};

Weibo.prototype.account = function () {
  return this._account;
};

Weibo.prototype.friendships = function () {
  return this._friendships;
};

Weibo.prototype.remind = function () {
  return this._remind;
};

Weibo.prototype.statuses = function () {
  return this._statuses;
};

Weibo.prototype.users = function () {
  return this._users;
};

exports.Weibo = Weibo;