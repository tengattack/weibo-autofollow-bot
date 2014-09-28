(function() {

  var mongoose = require('mongoose');
  var Schema = mongoose.Schema;
  var config = require('./../../config/db');

  function Database() {
    this.connect();
  }

  Database.prototype.connect = function() {
    var connectUrl = 'mongodb://' + config.DB_USER + ':' + config.DB_PASS + '@' + config.DB_HOST + ':' + config.DB_PORT + '/' + config.DB_NAME;
    mongoose.connect(connectUrl, function (err) {
      if (err) {
        console.error('connect to %s error: ', config.db, err.message);
        process.exit(1);
      }
    });
  };

  exports.Database = Database;
  exports.Proxy = require('./proxy');

}).call(this);
