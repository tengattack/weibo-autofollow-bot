var mongoose = require('mongoose');

// models
require('./watch_list');

exports.WatchList = mongoose.model('WatchList');
