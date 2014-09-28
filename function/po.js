
var _ = require('underscore');

function list_text_at_users(text, no_uglyname) {
  var users = [];
  var pattern = /@([^ ]+?)[: ]/g;
  var uglyname = /^用户\d+$/;
  while ((m = pattern.exec(text))) {
    if (no_uglyname && m[1].match(uglyname)) continue;
    users.push(m[1]);
  }
  return users;
}

function list_at_users(statuses, no_uglyname) {
  var users = [];
  if (!statuses) return users;
  if (statuses instanceof Array) {
    for (var i = 0; i < statuses.length; i++) {
      users = _.union(users, list_at_users(statuses[i], no_uglyname));
    }
  } else if (statuses instanceof Object) {
    if (statuses.ad) {
      return users;
    }
    if (statuses.retweeted_status) {
      users = _.union(users, list_at_users(statuses.retweeted_status, no_uglyname));
    }
    users = _.union(users, list_text_at_users(statuses.text, no_uglyname));
  }
  return users;
}

exports.list_at_users = list_at_users;
exports.list_text_at_users = list_text_at_users;