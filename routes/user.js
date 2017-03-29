/**
 * Created by 45925 on 2017/3/15.
 */

var express = require('express');
var router = express.Router();

var UserModel = require('../models/users');
var CourseModel = require('../models/courses');
var AttenderModel = require('../models/attenders');
var checkLogin = require('../middlewares/check').checkLogin;

// GET /user/:userId
router.get('/:userId', function (req, res, next) {
  var authorId = req.params.userId;// 主页用户 id
  var user = req.session.user;// 当前登录用户 id
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
              courses: courses,
              rejcourses: rejcourses,
              isUser: isUser
            });
          });
      }
      else if(author && author.identity === 'student') {
        AttenderModel.getCoursessByUserId(authorId)
          .then(function (courses) {
            res.render('profile', {
              subtitle: author.name + ' - 个人主页',
              author: author,
              courses: courses,
              isUser: isUser
            });
          });
      }
      else if(author && author.identity === 'admin' && isUser) {
        CourseModel.getRejectedCourses()
          .then(function (courses) {
            res.render('profile', {
              subtitle: author.name + ' - 个人主页',
              author: author,
              courses: courses,
              isUser: isUser
            });
          });
      }
      else {
        res.render('404');
      }
    })
    .catch(next);
});

// GET /user/:userId/edit
router.get('/:userId/edit', checkLogin, function (req, res, next) {
  var authorId = req.params.userId;// 主页用户 id
  var userId = req.session.user._id;
  
  try {
    if(userId && authorId && userId.toString() !== authorId.toString()) {
      throw new Error('权限不足');
    }
  } catch (e) {
    req.flash('error', e.message);
    return res.redirect('back');
  }
  
  UserModel.getUserById(userId)
    .then(function (user) {
      res.render('editinfo',{
        subtitle: '编辑个人信息',
        user: user
      });
    })
    .catch(next);
});

// POST /user/:userId/edit
router.post('/:userId/edit', checkLogin, function (req, res, next) {
  var name = req.fields.name;
  var school = req.fields.school;
  var email = req.fields.email;
  var bio = req.fields.bio;
  var user = req.session.user;

  // 校验参数
  try {
    if (!(name.length >= 1 && name.length <= 12)) {
      throw new Error('姓名请限制在 1-12 个字符内');
    }
    if (!(school.length >= 1 && school.length <= 20)) {
      throw new Error('学校请限制在 1-20 个字符内');
    }
    if (!(bio.length >= 1 && bio.length <= 50)) {
      throw new Error('个人简介请限制在 1-50 个字符内');
    }
    if (email.length <= 0) {
      throw new Error('邮箱不能为空');
    }
    if (email.length >= 30) {
      throw new Error('邮箱长度超过限制');
    }
  } catch (e) {
    req.flash('error', e.message);
    return res.redirect('back');
  }

  UserModel.updateUserById(user._id, { name: name, school: school, email: email, bio: bio })
    .then(function () {
      req.flash('success', '编辑成功');
      return res.redirect(`/user/${user._id}`);
    })
    .catch(next);
});

// POST /user/:userId/avatar
router.post('/:userId/avatar', checkLogin, function (req, res, next) {
  
});

module.exports = router;