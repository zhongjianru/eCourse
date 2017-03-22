var fs = require('fs');
var path = require('path');
var sha1 = require('sha1');
var express = require('express');
var router = express.Router();

var UserModel = require('../models/users');
var checkNotLogin = require('../middlewares/check').checkNotLogin;

// GET /signup 注册页
router.get('/', checkNotLogin, function(req, res, next) {
  res.render('signup', { subtitle: '注册' });
});

// POST /signup 用户注册
router.post('/', checkNotLogin, function(req, res, next) {
  var name = req.fields.name;
  var identity = req.fields.gender;
  var school = req.fields.school;
  var bio = req.fields.bio;
  var avatar = req.files.avatar.path.split(path.sep).pop();// split(path.sep) 将路径转化为数组对象
  var username = req.fields.username;
  var password = req.fields.password;
  var repassword = req.fields.repassword;
  var fname = avatar.split('.');
  var status = '0';// 0 未审核，1 已审核

  // 学生注册不需要经过审核，教师则需要
  if(identity === 'student') {
    status = '1';
  }

  // 校验参数
  try {
    if (!(username.length >= 6 && username.length <= 16)) {
      throw new Error('用户名请限制在 6-16 个字符内');
    }
    if (!(name.length >= 1 && name.length <= 12)) {
      throw new Error('姓名请限制在 1-12 个字符内');
    }
    if (['student', 'teacher'].indexOf(identity) === -1) {
      throw new Error('职业只能为学生或教师');
    }
    if (!(school.length >= 1 && school.length <= 20)) {
      throw new Error('学校请限制在 1-20 个字符内');
    }
    if (!(bio.length >= 1 && bio.length <= 200)) {
      throw new Error('个人简介请限制在 1-200 个字符内');
    }
    if (!req.files.avatar.name) {
      throw new Error('缺少头像');
    }
    if (!(password.length >= 6 && password.length <= 16)) {
      throw new Error('密码请限制在 6-16 个字符内');
    }
    if (password !== repassword) {
      throw new Error('两次输入密码不一致');
    }
    if(['gif', 'jpeg', 'jpg', 'png'].indexOf(fname[fname.length - 1]) === -1) {
      throw new Error('上传头像格式只能为gif、jpg或png');
    }
  } catch (e) {
    // 注册失败，异步删除上传的头像
    fs.unlink(req.files.avatar.path);
    req.flash('error', e.message);
    return res.redirect('/signup');
  }

  // 明文密码加密
  password = sha1(password);

  // 待写入数据库的用户信息
  var user = {
    name: name,
    username: username,
    password: password,
    school: school,
    identity: identity,
    bio: bio,
    avatar: avatar,
    status: status
  };
  // 用户信息写入数据库
  UserModel.create(user)
    .then(function (result) {
      // 此 user 是插入 mongodb 后的值，包含 _id
      user = result.ops[0];
      // 将用户信息存入 session
      delete user.password;
      req.session.user = user;
      // 写入 flash
      req.flash('success', '注册成功');
      // 跳转到首页
      res.redirect('/posts');
    })
    .catch(function (e) {
      // 注册失败，异步删除上传的头像
      fs.unlink(req.files.avatar.path);
      // 用户名被占用则跳回注册页，而不是错误页
      if (e.message.match('E11000 duplicate key')) {
        req.flash('error', '用户名已被占用');
        return res.redirect('/signup');
      }
      next(e);
    });
});

module.exports = router;
