
function WeiboFriendships(wb) {
  this.wb = wb;
}

WeiboFriendships.prototype.paras = function (paras, callback) {
  if (paras instanceof Function) {
    callback = paras;
    paras = { uid: this.wb.uid }; //self
  }
  if (!paras.uid) {
    paras.uid = this.wb.uid;
  }
  return {
    paras: paras,
    callback: callback
  };
};

WeiboFriendships.prototype.create = function (paras, callback) {
  //debug
  if (this.wb.opt.debug) {
    callback(null, {
      id: paras.uid,
      following: true
    });
  } else {
    this.wb.request('2/friendships/create.json', paras, callback);
  }
};

WeiboFriendships.prototype.destroy = function (paras, callback) {
  if (!this.wb.opt.debug) {
    this.wb.request('2/friendships/destroy.json', paras, callback);
  }
};

//http://open.weibo.com/qa/index.php?qa=29601
//only return 30%

WeiboFriendships.prototype.friends = function (paras, callback) {
  var p = this.paras(paras, callback);
  this.wb.request('2/friendships/friends.json', p.paras, p.callback);
};

WeiboFriendships.prototype.friends_ids = function (paras, callback) {
  var p = this.paras(paras, callback);
  this.wb.request('2/friendships/friends/ids.json', p.paras, p.callback);
};

WeiboFriendships.prototype.followers = function (paras, callback) {
  var p = this.paras(paras, callback);
  this.wb.request('2/friendships/followers.json', p.paras, p.callback);
};

WeiboFriendships.prototype.followers_ids = function (paras, callback) {
  var p = this.paras(paras, callback);
  this.wb.request('2/friendships/followers/ids.json', p.paras, p.callback);
};

exports.WeiboFriendships = WeiboFriendships;
