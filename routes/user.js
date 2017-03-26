/**
 * Created by 45925 on 2017/3/15.
 */

var express = require('express');
var router = express.Router();

var UserModel = require('../models/users');
var CourseModel = require('../models/courses');
var AttenderModel = require('../models/attenders');

// GET /user/:userId
router.get('/:userId', function (req, res, next) {
  var authorId = req.params.userId;// 主页用户 id
  var user = req.session.user;// 当前登录用户
  var isUser = false;// 访问主页的用户是不是该主页显示的用户
  
  if(authorId && user && authorId.toString() === user._id.toString()) {
    isUser = true;
  }

  UserModel.getUserById(authorId)
    .then(function (author) {
      // 教师显示发布的课程，学生显示加入的课程
      try {
        if(!author) {
          throw new Error('该用户不存在');
        }
      } catch (e) {
        req.flash('error', e.message);
        return res.redirect('/courses');
      }

      if(author && author.identity === 'teacher') {
        Promise.all([
            CourseModel.getCoursesByUserId(authorId),
            CourseModel.getRejectedCoursesByUserId(authorId)
          ])
          .then(function (result) {
            var courses = result[0];
            var rejcourses = result[1];// 审核未通过的课程
            
            res.render('profile', {
              subtitle: author.name + ' - 个人主页',
              author: author,
              user: user,
              courses: courses,
              rejcourses: rejcourses,
              isUser: isUser
            });
          });
      }
      else {
        AttenderModel.getCoursessByUserId(authorId)
          .then(function (courses) {
            res.render('profile', {
              subtitle: author.name + ' - 个人主页',
              author: author,
              user: user,
              courses: courses,
              isUser: isUser
            });
          });
      }
    })
    .catch(next);
});

module.exports = router;