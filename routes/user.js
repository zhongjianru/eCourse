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
  var authorId = req.params.userId;// 主页用户 id
  var user = req.session.user;// 当前登录用户
  var isUser = false;// 访问主页的用户是不是该主页显示的用户
  
  if(authorId.toString() === user._id.toString()) {
    isUser = true;
  }

  UserModel.getUserById(authorId)
    .then(function (author) {
      // 教师显示发布的课程，学生显示加入的课程
      if(author.identity === 'teacher') {
        Promise.all([
            PostModel.getPostsByUserId(authorId),
            PostModel.getRejectedPostsByUserId(authorId)
          ])
          .then(function (result) {
            var posts = result[0];
            var rejposts = result[1];// 审核未通过的课程
            
            res.render('profile', {
              subtitle: author.name + ' - 个人主页',
              author: author,
              user: user,
              posts: posts,
              rejposts: rejposts,
              isUser: isUser
            });
          });
      }
      else {
        AttenderModel.getPostsByUserId(authorId)
          .then(function (posts) {
            res.render('profile', {
              subtitle: author.name + ' - 个人主页',
              author: author,
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