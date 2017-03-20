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
  var user = req.session.user;
  var isUser = false;// 访问主页的用户是不是该主页显示的用户
  
  if(userId.toString() === user._id.toString()) {
    isUser = true;
  }

  UserModel.getUserById(userId)
    .then(function (user) {
      // 教师显示发布的课程，学生显示加入的课程
      if(user.identity === 'teacher') {
        Promise.all([
            PostModel.getPosts(userId),
            PostModel.getRejectedPosts()
          ])
          .then(function (result) {
            var posts = result[0];
            var rejposts = result[1];// 审核未通过的课程
            
            res.render('profile', {
              subtitle: user.name + ' - 个人主页',
              user: user,
              posts: posts,
              rejposts: rejposts,
              isUser: isUser
            });
          });
      }
      else {
        AttenderModel.getPostsByUserId(userId)
          .then(function (posts) {
            res.render('profile', {
              subtitle: user.name + ' - 个人主页',
              user: user,
              posts: posts,
              isUser: isUser
            });
          });
      }
    })
    .catch(next);
});

module.exports = router;