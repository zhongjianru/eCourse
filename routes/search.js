/**
 * Created by zhongjr on 2017/4/6.
 */

var express = require('express');
var router = express.Router();

var UserModel = require('../models/users');
var CourseModel = require('../models/courses');

router.post('/', function (req, res, next) {
  var type = req.fields.type;
  var words = req.fields.words;
  
  if(type.toString() === 'course') {
    CourseModel.searchCoursesByTitle(words)
      .then(function (courses) {
        res.render('search', {
          subtitle: '搜索结果',
          result: courses,
          words: words,
          type: type
        });
      })
      .catch(next);
  }
  else {
    UserModel.searchUsersByName(words)
      .then(function (users) {
        res.render('search', {
          subtitle: '搜索结果',
          result: users,
          words: words,
          type:type,
          isUser: false
        });
      })
      .catch(next);
  }
});

module.exports = router;
