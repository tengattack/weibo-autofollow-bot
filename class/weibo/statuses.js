
function WeiboStatuses(wb) {
  this.wb = wb;
}

WeiboStatuses.prototype.home_timeline = function (callback) {
  this.wb.request('2/statuses/home_timeline.json', callback);
};

WeiboStatuses.prototype.bilateral_timeline = function (callback) {
  this.wb.request('2/statuses/bilateral_timeline.json', callback);
};

exports.WeiboStatuses = WeiboStatuses;