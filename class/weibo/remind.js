
function WeiboRemind(wb) {
  this.wb = wb;
}

WeiboRemind.prototype.unread_count = function (callback) {
  this.wb.request('2/remind/unread_count.json', callback);
};

WeiboRemind.prototype.set_count = function (type, callback) {
  this.wb.request('2/remind/set_count.json', {type: type}, callback);
};

exports.WeiboRemind = WeiboRemind;