
function filter_po(po) {
  if (!po) {
    return false;
  }
  return true;
}

function filter_user(user) {
  if (!user) {
    return false;
  }
  if (Math.floor(user.friends_count * 1.2) > user.followers_count) {
    return false;
  }
  return true;
}

exports.filter_po = filter_po;
exports.filter_user = filter_user;