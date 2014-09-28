
function WeiboAccount(wb) {
  this.wb = wb;
}

WeiboAccount.prototype.get_uid = function (callback) {
  this.wb.request('2/account/get_uid.json', callback);
};

exports.WeiboAccount = WeiboAccount;