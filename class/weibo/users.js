
function WeiboUsers(wb) {
  this.wb = wb;
}

WeiboUsers.prototype.show = function (paras, callback) {
  this.wb.request('2/users/show.json', paras, callback);
};

exports.WeiboUsers = WeiboUsers;