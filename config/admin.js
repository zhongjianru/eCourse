/**
 * Created by zhongjr on 2017/3/29.
 */

var sha1 = require('sha1');
var UserModel = require('../models/users');

module.exports = {
  init: function init() {
    var admin = {
      name: 'admin',
      username: 'admin',
      password: sha1('888888'),
      identity: 'admin',
      bio: 'eCourse系统管理员',
      avatar: 'admin.png',
      school: 'eCourse',
      email: 'admin@ecourse.com'
    };

    UserModel.getUserByUsername('admin')
      .then(function (user) {
        if(user) {
          UserModel.delUserByUsername('admin');
        }
        UserModel.create(admin)
          .then(function () {
            console.log('admin has been created');
          });
      });
  }
};
