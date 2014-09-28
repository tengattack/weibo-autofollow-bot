var EventProxy = require('eventproxy');

var models = require('../model');
var WatchList = models.WatchList;

exports.getBlackList = function(callback) {
  WatchList.find({type: 'black'}, callback);
};

exports.findDead = function(dead_time, callback) {
  var d = new Date(new Date().valueOf() - dead_time);
  WatchList.find({create_at: {$lt: d}, type: 'watch'}, callback);
};

exports.updateType = function(Ids, type, callback) {
  WatchList.update({_id: {$in: Ids}}, {$set: {type: type, update_at: Date.now()}}, {multi: true}, callback);
};

exports.newAndSave = function(uid, screen_name, callback) {
  var wl = new WatchList();
  wl.uid = uid;
  wl.screen_name = screen_name;
  wl.type = 'watch';
  wl.save(callback);
};

exports.remove = function(Ids, callback) {
  WatchList.remove({_id: {$in: Ids}}, callback);
};
