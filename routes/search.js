/**
 * Created by zhongjr on 2017/4/6.
 */

var express = require('express');
var router = express.Router();

var UserModel = require('../models/users');
var CourseModel = require('../models/courses');

router.post('/', function (req, res, next) {
  var words = req.fields.searchterm;

  Promise.all([
      CourseModel.searchCoursesByTitle(words),
      UserModel.searchUsersByName(words)
    ])
    .then(function (result) {
      var courses = result[0];
      var users = result[1];

      res.render('search', {
        subtitle: '搜索结果',
        courses: courses,
        users: users,
        isUser: false
      });
    })
    .catch(next);
});

module.exports = router;
