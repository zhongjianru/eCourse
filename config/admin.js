/**
 * Created by zhongjr on 2017/3/29.
 */

var sha1 = require('sha1');
var UserModel = require('../models/users');

module.exports = {
  init: function init() {
    var admin = {
      username: 'admin',
      password: sha1('888888'),
      identity: 'admin'
    };

    UserModel.getUserByUsername('admin')
      .then(function (user) {
        if(!user) {
          UserModel.create(admin)
            .then(function () {
              console.log('admin has been created');
            });
        }
        else {
          console.log('admin already exists');
        }
      });
  }
};
