"use strict"

var EventProxy = require('eventproxy');
var _ = require('underscore');

var config = require('./config');
var DB = require('./class/db');
var Weibo = require('./class/weibo').Weibo;
var WeiboWeb = require('./class/weibo_web').WeiboWeb;

var po = require('./function/po');
var filter = require('./function/filter');

console.log('initing...');
var ep = new EventProxy();

var db = new DB.Database();
var WatchList = DB.Proxy.WatchList;
var wb = new Weibo(config.weibo, {debug: false});
var wbweb = new WeiboWeb(config.weibo.WEB_COOKIE);
var _e = {};

//wb.oauth2_access_token();
//return;
/*
//fetch unread message
wb.remind().unread_count(function (err, data) {
  wb.remind().set_count('follower', function () {});
  console.log(data);
});
*/

ep.once('wb_init', function () {
  console.log('uid: ' + wb.uid);

  console.log('getting friendships...');
  ep.emit('get_fo_users', null);
  ep.emit('get_fans_users', null);
  //debug
  /*_e.fos = [];
  _e.fans = [];
  ep.emit('fos', _e.fos);
  ep.emit('fans', _e.fans);*/
});

function usersMongoI(users) {
  var ou = [];
  if (!users) return ou;
  _.each(users, function (user) {
    if (user) {
      ou.push({
        id: parseInt(user.uid),
        screen_name: user.screen_name,
      });
    }
  });
  return ou;
}

function usersI(users) {
  var ou = [];
  if (!users) return ou;
  for (var i = 0; i < users.length; i++) {
    if (!users[i] || !users[i].id) continue;
    ou.push({
      id: users[i].id,
      screen_name: users[i].screen_name,
      following: users[i].following,
      follow_me: users[i].follow_me
    });
  }
  return ou;
}

function usersU(users, new_users) {
  return _.uniq(_.union(users, new_users), false, function (item, key, a) { return item.id; });
}

function get_users(users, opt, callback) {
  var nfusers = [];
  var not_fo = (opt.type == 'not_fo');
  var notinlist = (not_fo ? _e.fos : _e.fans);
  var users1 = _.filter(users, function (screen_name) {
    var nf = !_.find(notinlist, function (user) {
      return user.screen_name == screen_name;
    });
    if (nf) {
      nf = !_.find(_e.blacks, function (user) {
        return user.screen_name == screen_name;
      });
    }
    return nf;
    //return _.where(_e.fos, {screen_name: screen_name}).length === 0;
  });

  //get users
  var uep = new EventProxy();
  uep.after('got_users', users1.length, function (list) {
    var users2;
    if (not_fo) {
      var list2 = _.filter(list, filter.filter_user);
      users2 = usersI(list2);
    } else {
      users2 = list;
    }
    //check blacklist
    var users3 = _.filter(users2, function (user) {
      var nf = !_.find(_e.blacks, function (nuser) {
        return nuser.id == user.id;
      });
      if (nf) {
        nf = !_.find(notinlist, function (nuser) {
          return nuser.id == user.id;
        });
      }
      return nf;
    });

    var ufos = _.filter(users3, function (user) { return user.following });
    var ufans = _.filter(users3, function (user) { return user.follow_me });

    //merge
    if (ufos.length) _e.fos = usersU(_e.fos, ufos);
    if (ufans.length) _e.fans = usersU(_e.fans, ufans);

    var unfs;
    if (not_fo) {
      unfs = _.filter(users3, function (user) { return !user.following });
    } else {
      unfs = _.filter(users3, function (user) { return !user.follow_me });
    }
    callback(null, unfs);
  });
  _.each(users1, function (u) {
    wb.users().show(
      (opt.screen_name ? {screen_name: u} : {uid: u}),
      function (err, user) {
        uep.emit('got_users', user);
    });
  });
}

function fetch_timeline() {
  //Fetch timeline
  wb.statuses().bilateral_timeline(ep.done(function (data) {
    var pos = _.filter(data.statuses, filter.filter_po);
    var users = po.list_at_users(pos, true);
    get_users(users, {type: 'not_fo', screen_name: true}, ep.done(function (not_fo_users) {
      if (not_fo_users.length) {
        //set max 20 users one times
        var __users = not_fo_users.slice(0, 20);
        console.log('friendships(' + __users.length + ') creating...');
        var __i = 0;
        var __t = setInterval(function () {
          var user = __users[__i];
          wbweb.followed(user.id, 
          //wb.friendships().create({uid: user.id},
            ep.done(function (data) {
              //data.data.relation.following
            /*if (data.following)*/ {
              console.log('with @' + user.screen_name);
              WatchList.newAndSave(user.id, user.screen_name, function (err, u) {
                //console.log(err, u);
              });
            }
          }));
          __i++;
          if (__i >= __users.length) {
            clearInterval(__t);
            fetch_timeline_delay();
          }
        }, 5000);
        //_.each(not_fo_users, function (user) {

        //});
        _e.fos = _.union(_e.fos, usersI(not_fo_users));
      } else {
        console.log('no new friendship.');
        fetch_timeline_delay();
      }
    }));
  }));
}

function check_dead() {
  WatchList.findDead(1000 * 60 * 30, function (err, users) {
    var uids = [];
    _.each(users, function (u) {
      uids.push(parseInt(u.uid));
    });
    get_users(uids, {type: 'not_fans', screen_name: false}, ep.done(function (not_fans_users) {
      var blk_users = [];
      var befans_users = [];
      var date_now = Date.now();
      _.each(users, function (u) {
        var nu = _.find(not_fans_users, function (nuser) {
          return parseInt(u.uid) == nuser.id;
        });
        if (!nu) {
          befans_users.push(u);
        } else {
          nu._id = u._id;
          if (!nu.status) {
            blk_users.push(nu);
          } else {
            //if (!nu.status.in_reply_to_status_id) 
            var lastStatusDate = new Date(nu.status.created_at);
            //最后活动的时间在fo之后，表明该人对所有者不感兴趣
            if (lastStatusDate > u.create_at 
                || ((date_now - u.create_at) > (1000 * 60 * 60 * 24 * 2))) {
              //console.log('lastStatusDate > u.create_at @' + nu.screen_name);
              blk_users.push(nu);
            }
          }
        }
      });
      if (befans_users.length) {
        var str_users = '';
        var befans_ids = [];
        _.each(befans_users, function (u) {
          befans_ids.push(u._id);
          str_users += '@' + u.screen_name + ' ';
        });
        console.log('befans_users: ', str_users);
        WatchList.remove(befans_ids, function (err, count) {});

        var __users2 = usersMongoI(befans_users);
        _e.fans = _.union(_e.fans, __users2);

        var __i2 = 0;
        var __t2 = setInterval(function () {
          var user = __users2[__i2];
          //TODO send other messages
          wbweb.message_add(user.id,
              '感谢关注~ 可以和本人聊关于ACG和技术相关的话题w \r\n请多关照ლ(╹◡╹ლ )',
              function (err, data) {
            var errstr = '';
            if (err) {
              try { errstr = JSON.stringify(err); } catch (e) {}
            }
            console.log('message to @' + user.screen_name + (errstr ? (' ' + errstr) : '' ));
          });
          __i2++;
          if (__i2 >= __users2.length) {
            clearInterval(__t2);
          }
        }, 5000);
      }
      if (blk_users.length) {
        var str_users = '';
        var blk_ids = [];
        _e.blacks = usersU(_e.blacks, usersI(blk_users));
        _.each(blk_users, function (u) {
          blk_ids.push(u._id);
          str_users += '@' + u.screen_name + ' ';
          //unfo
          wbweb.unfollow(u.id, function (err, data) {});
          //wb.friendships().destroy({uid: u.id}, function (err, count) {});
        });
        console.log('blk_users: ', str_users);
        WatchList.updateType(blk_ids, 'black', function (err, count) {});
      }
    }));
  });
}

function fetch_timeline_delay(instant) {
  var ffetch = function () {
    console.log('fetching timeline...');
    fetch_timeline();
  };
  if (instant) {
    ffetch();
  } else {
    //3min
    setTimeout(ffetch, 1000 * 60 * 45);
  }
}

function check_dead_start() {
  check_dead();
  setInterval(check_dead, 1000 * 60 * 60);
}

ep.on('get_fo_users', function (data) {
  var cursor = 0;
  if (data) {
    cursor = data.next_cursor;
    _e.fos = _.union(_e.fos, usersI(data.users));
    if (!data.users.length) {
      ep.emit('fos', _e.fos);
      return;
    }
  } else {
    //reset
    _e.fos = [];
  }
  //http://open.weibo.com/qa/index.php?qa=29601
  //only return 30%
  wb.friendships().friends({cursor: cursor}, ep.done('get_fo_users'));
});

ep.on('get_fans_users', function (data) {
  var cursor = 0;
  if (data) {
    cursor = data.next_cursor;
    _e.fans = _.union(_e.fans, usersI(data.users));
    if (!data.users.length) {
      ep.emit('fans', _e.fans);
      return;
    }
  } else {
    //reset
    _e.fans = [];
  }
  wb.friendships().followers({cursor: cursor}, ep.done('get_fans_users'));
});

ep.all('fos', 'fans', 'blacks', function (fos, fans, blacks) {
  _e.blacks = usersMongoI(blacks);

  check_dead_start();
  fetch_timeline_delay();
});

ep.fail(function (err) {
  console.log(err);
});

wb.init(ep.done('wb_init'));
WatchList.getBlackList(ep.done('blacks'));

