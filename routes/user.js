/**
 * Created by 45925 on 2017/3/15.
 */

var express = require('express');
var router = express.Router();

var UserModel = require('../models/users');
var PostModel = require('../models/posts');
var AttenderModel = require('../models/attenders');

// GET /user/:userId
router.get('/:userId', function (req, res, next) {
  var userId = req.params.userId;

  UserModel.getUserById(userId)
    .then(function (user) {
      // 教师显示发布的课程，学生显示加入的课程
      if(user.identity === 'teacher') {
        PostModel.getPosts(userId)
          .then(function (posts) {
            res.render('profile', {
              subtitle: user.name + ' - 个人主页',
              user: user,
              posts: posts
            });
          });
      }
      else {
        AttenderModel.getPostsByUserId(userId)
          .then(function (posts) {
            res.render('profile', {
              subtitle: user.name + ' - 个人主页',
              user: user,
              posts: posts
            });
          });
      }
    })
    .catch(next);
});

module.exports = router;