var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var ObjectId = Schema.ObjectId;

var WatchListSchema = new Schema({
  uid: {
    type: Number, unique: true, index: true
  },
  screen_name: {
    type: String
  },
  type: {
    type: String
  },
  create_at: {
    type: Date,
    default: Date.now
  },
  update_at: {
    type: Date,
    default: Date.now
  }
});

mongoose.model('WatchList', WatchListSchema);
