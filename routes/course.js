var fs = require('fs');
var path = require('path');
var express = require('express');
var router = express.Router();

var UserModel = require('../models/users');
var CourseModel = require('../models/courses');
var CommentModel = require('../models/comments');
var AttenderModel = require('../models/attenders');
var LessonModel = require('../models/lessons');
var CozwareModel = require('../models/cozwares');
var LessoncmtModel = require('../models/lessoncmts');
var LessonhwkModel = require('../models/lessonhwks');
var checkLogin = require('../middlewares/check').checkLogin;

// GET /course/create 发布课程页
router.get('/create', checkLogin, function(req, res, next) {
  UserModel.getUserById(req.session.user._id)
    .then(function (user) {
      try {
        if (user && user.identity !== 'teacher') {
          throw new Error('权限不足');
        }
      } catch (e) {
        req.flash('error', e.message);
        return res.redirect('/courses');
      }

      res.render('create', { subtitle: '发布课程' });
    })
    .catch(next);
});

// POST /course/create 发布课程
router.post('/create', checkLogin, function(req, res, next) {
  var author = req.session.user._id;
  var title = req.fields.title;
  var content = req.fields.content;
  var type = req.fields.type;

  // 校验参数
  try {
    if (!title.length) {
      throw new Error('请填写课程名称');
    }
    if (!(title.length >= 1 && title.length <= 50)) {
      throw new Error('课程名称字数限制为1-50');
    }
    if (!content.length) {
      throw new Error('请填写课程简介');
    }
    if (!(content.length >= 100 && content.length <= 2000)) {
      throw new Error('课程简介字数限制为100-2000');
    }
  } catch (e) {
    req.flash('error', e.message);
    return res.redirect('back');
  }

  var course = {
    author: author,
    title: title,
    content: content,
    type: type,
    pv: 0,
    cmt: 0,
    atd: 0,
    status: '0'
  };

  CourseModel.create(course)
    .then(function (result) {
      // 此 course 是插入 mongodb 后的值，包含 _id
      course = result.ops[0];
      req.flash('success', '发布课程成功');
      // 发布成功后跳转到该课程页
      return res.redirect(`/course/${course._id}`);
    })
    .catch(next);
});

// GET /course/:courseId 课程页
router.get('/:courseId', function(req, res, next) {
  var courseId = req.params.courseId;
  var userId = '';
  if (req.session.user) {
    userId = req.session.user._id;
  }

  Promise.all([
      CourseModel.getCourseById(courseId),// 获取课程
      CommentModel.getComments(courseId),// 获取该课程所有留言
      AttenderModel.getAttenders(courseId),// 获取该课程所有参与者
      AttenderModel.isAttended(userId, courseId),// 获取当前用户是否已加入该课程
      LessonModel.getLessons(courseId),// 获取该课程所有课程内容
      CourseModel.incPv(courseId)// pv 加 1
    ])
    .then(function (result) {
      var course = result[0];
      var comments = result[1];
      var attendances = result[2];
      var isAttended = result[3];
      var lessons = result[4];

      try {
        if (!course) {
          throw new Error('该课程不存在');
        }
      } catch (e) {
        req.flash('error', e.message);
        return res.redirect('/courses');
      }

      res.render('course', {
        subtitle: course.title + ' - 课程页',
        course: course,
        comments: comments,
        attendances: attendances,
        isAttended: isAttended,
        lessons: lessons
      });
    })
    .catch(next);
});

// GET /course/:courseId/edit 更新课程页
router.get('/:courseId/edit', checkLogin, function(req, res, next) {
  var courseId = req.params.courseId;
  var user = req.session.user;

  CourseModel.getRawCourseById(courseId)
    .then(function (course) {
      try {
        if (!course) {
          throw new Error('该课程不存在');
        }
        if (user && course.author && user._id.toString() !== course.author._id.toString()) {
          throw new Error('权限不足');
        }
      } catch (e) {
        req.flash('error', e.message);
        return res.redirect(`/course/${courseId}`);
      }

      res.render('edit', {
        subtitle: course.title + ' - 修改课程',
        course: course
      });
    })
    .catch(next);
});

// POST /course/:courseId/edit 更新课程
router.post('/:courseId/edit', checkLogin, function(req, res, next) {
  var courseId = req.params.courseId;
  var author = req.session.user._id;
  var title = req.fields.title;
  var content = req.fields.content;
  var type = req.fields.type;

  // 校验参数
  try {
    if (!title.length) {
      throw new Error('请填写课程名称');
    }
    if (!(title.length >= 1 && title.length <= 50)) {
      throw new Error('课程名称字数限制为1-50');
    }
    if (!content.length) {
      throw new Error('请填写课程简介');
    }
    if (!(content.length >= 100 && content.length <= 2000)) {
      throw new Error('课程简介字数限制为100-2000');
    }
  } catch (e) {
    req.flash('error', e.message);
    return res.redirect('back');
  }

  CourseModel.updateCourseById(courseId, author, { title: title, content: content, type: type, status: '0' })
    .then(function () {
      req.flash('success', '编辑课程成功');
      // 编辑成功后跳转到上一页
      return res.redirect(`/course/${courseId}`);
    })
    .catch(next);
});

// GET /course/:courseId/remove 删除课程
router.get('/:courseId/remove', checkLogin, function(req, res, next) {
  var courseId = req.params.courseId;
  var user = req.session.user;

  CourseModel.getCourseById(courseId)
    .then(function (course) {
      try {
        if (!course) {
          throw new Error('该课程不存在');
        }
        if (user && course.author && user._id.toString() !== course.author._id.toString()) {
          throw new Error('权限不足');
        }
      } catch (e) {
        req.flash('error', e.message);
        return res.redirect(`/course/${courseId}`);
      }

      CourseModel.delCourseById(courseId, user._id)
        .then(function () {
          req.flash('success', '删除课程成功');
          // 删除成功后跳转到主页
          return res.redirect('/courses');
        });
    })
    .catch(next);
});

// POST /course/:courseId/comment 创建一条留言
router.post('/:courseId/comment', checkLogin, function(req, res, next) {
  var author = req.session.user._id;
  var courseId = req.params.courseId;
  var content = req.fields.content;

  CourseModel.getCourseById(courseId)
    .then(function (course) {
      // 校验参数
      try {
        if (!course) {
          throw new Error('该课程不存在');
        }
        if (course.status === '0') {
          throw new Error('该课程未通过审核');
        }
        if (!content.length) {
          throw new Error('请填写留言内容');
        }
        if (!(content.length >= 1 && content.length <= 500)) {
          throw new Error('留言字数限制为1-500');
        }
      } catch (e) {
        req.flash('error', e.message);
        return res.redirect('back');
      }

      var comment = {
        author: author,
        courseId: courseId,
        content: content,
        isFirst: '1',
        reply: 0
      };

      CommentModel.create(comment)
        .then(function () {
          CourseModel.incCmt(courseId);
          req.flash('success', '留言成功');
          // 留言成功后跳转到上一页
          return res.redirect('back');
        });
    })
    .catch(next);
});

// GET /course/:courseId/comment/:commentId/remove 删除一条留言
router.get('/:courseId/comment/:commentId/remove', checkLogin, function(req, res, next) {
  var courseId = req.params.courseId;
  var commentId = req.params.commentId;
  var user = req.session.user;

  CommentModel.getCommentById(commentId)
    .then(function (comment) {
      try {
        if (!comment) {
          throw new Error('该留言不存在');
        }
        if (user && comment.author && user._id.toString() !== comment.author._id.toString()) {
          throw new Error('权限不足');
        }
      } catch (e) {
        req.flash('error', e.message);
        return res.redirect(`/course/${courseId}`);
      }

      CommentModel.delCommentById(commentId, user._id)
        .then(function () {
          if (comment.toComment) {
            CommentModel.decReply(comment.toComment);
          }
          CourseModel.decCmt(courseId);
          req.flash('success', '删除留言成功');
          // 删除成功后跳转到上一页
          return res.redirect('back');
        });
    })
    .catch(next);
});

// POST /course/:courseId/comment/:commentId/reply 回复一条留言
router.post('/:courseId/comment/:commentId/reply', checkLogin, function(req, res, next) {
  var courseId = req.params.courseId;
  var commentId = req.params.commentId;
  var author = req.session.user._id;
  var content = req.fields.content;

  CommentModel.getCommentById(commentId)
    .then(function (toComment) {
      try {
        if (!toComment) {
          throw new Error('该留言不存在');
        }
      } catch (e) {
        req.flash('error', e.message);
        return res.redirect(`/course/${courseId}`);
      }

      var comment = {
        author: author,
        courseId: courseId,
        content: content,
        toComment: commentId,
        toAuthor: toComment.author._id,
        toAuthorName: toComment.author.name,
        isFirst: '0',
        reply: 0
      };

      CommentModel.create(comment)
        .then(function () {
          CourseModel.incCmt(courseId);
          CommentModel.incReply(commentId);
          req.flash('success', '回复成功');
          // 留言成功后跳转到上一页
          return res.redirect('back');
        });
    })
    .catch(next);
});

// POST /course/:courseId/attend 添加课程参与人
router.post('/:courseId/attend', checkLogin, function(req, res, next) {
  var courseId = req.params.courseId;
  var user = req.session.user;

  CourseModel.getCourseById(courseId)
    .then(function (course) {
      try {
        if (!course) {
          throw new Error('该课程不存在');
        }
        if (course.status === '0') {
          throw new Error('该课程未通过审核');
        }
        if (user.identity === 'teacher') {
          throw new Error('教师不能加入课程');
        }
      } catch (e) {
        req.flash('error', e.message);
        return res.redirect('back');
      }

      var attender = {
        courseId: courseId,
        author: course.author._id,
        attender: user._id
      };

      AttenderModel.create(attender)
        .then(function () {
          CourseModel.incAtd(courseId);
          req.flash('success', '加入课程成功');
          // 加入课程成功后跳转到上一页
          return res.redirect('back');
        });
    })
    .catch(next);
});

// GET /course/:courseId/attend/:attendId/remove 删除课程参与人
router.get('/:courseId/attend/:attendId/remove', checkLogin, function (req, res, next) {
  var courseId = req.params.courseId;
  var attendId = req.params.attendId;
  var user = req.session.user;

  Promise.all([
      CourseModel.getCourseById(courseId),
      AttenderModel.isAttended(user._id, courseId)
    ])
    .then(function (result) {
      var course = result[0];
      var isAttend = result[1];

      try {
        if (!course) {
          throw new Error('该课程不存在');
        }
        if (!isAttend) {
          throw new Error('权限不足');
        }
      } catch (e) {
        req.flash('error', e.message);
        return res.redirect(`/course/${courseId}`);
      }

      AttenderModel.delAttenderById(attendId, user._id)
        .then(function () {
          CourseModel.decAtd(courseId);
          req.flash('success', '退出课程成功');
          // 退出课程成功后跳转到上一页
          return res.redirect('back');
        });
    })
    .catch(next);
});

// GET /course/:courseId/lesson 添加课程内容页
router.get('/:courseId/lesson', checkLogin, function(req, res, next) {
  var courseId = req.params.courseId;
  var user = req.session.user;

  CourseModel.getCourseById(courseId)
    .then(function (course) {
      try {
        if (!course) {
          throw new Error('该课程不存在');
        }
        if (course.status === '0') {
          throw new Error('该课程未通过审核');
        }
        if (user._id.toString() !== course.author._id.toString()) {
          throw new Error('权限不足');
        }
      } catch (e) {
        req.flash('error', e.message);
        return res.redirect(`/course/${courseId}`);
      }

      res.render('addlesson', {
        subtitle: '添加课程内容',
        courseId: courseId
      });
    })
    .catch(next);
});

// POST /course/:courseId/lesson 添加课程内容
router.post('/:courseId/lesson', checkLogin, function (req, res, next) {
  var author = req.session.user._id;
  var courseId = req.params.courseId;
  var order = req.fields.order;
  var title = req.fields.title;
  var content = req.fields.content;

  try {
    if (!order.length) {
      throw new Error('课时不能为空');
    }
    if (order <= 0) {
      throw new Error('课时只能为正整数');
    }
    if (order > 200) {
      throw new Error('课时数超过限制');
    }
    if (!(title.length >= 1 && title.length <= 50)) {
      throw new Error('标题字数限制为1-50');
    }
    if (!(content.length >= 100 && content.length <= 10000)) {
      throw new Error('内容字数限制为100-10000');
    }
  } catch (e) {
    req.flash('error', e.message);
    return res.redirect('back');
  }

  var lesson = {
    courseId: courseId,
    author: author,
    order: order,
    title: title,
    content: content
  };

  LessonModel.create(lesson)
    .then(function () {
      req.flash('success', '添加课程内容成功');
      // 添加课程内容成功后跳转到上一页
      return res.redirect(`/course/${courseId}`);
    })
    .catch(next);
});

// GET /course/:courseId/lesson/:lessonId 课程内容页
router.get('/:courseId/lesson/:lessonId', function (req, res, next) {
  var courseId = req.params.courseId;
  var lessonId = req.params.lessonId;
  var user = req.session.user;
  var hwks = [];
  var cmts = [];
  var isAuthor = false;

  Promise.all([
      LessonModel.getLessonById(lessonId),
      CourseModel.getCourseById(courseId),
      CozwareModel.getCozwares(lessonId),
      LessonhwkModel.getLessonhwks(lessonId),// 教师显示所有学生的作业
      LessoncmtModel.getLessoncmts(lessonId),// 教师显示所有学生的留言
      LessonhwkModel.getLessonhwksByUserId(user._id),// 学生显示自己的作业
      LessoncmtModel.getLessoncmtsByUserId(user._id) // 学生显示自己的留言
    ])
    .then(function (result) {
      var lesson = result[0];
      var course = result[1];
      var cozwares = result[2];

      if (user._id && user._id.toString() === lesson.author._id.toString()) {
        hwks = result[3];
        cmts = result[4];
        isAuthor = true;
      }
      else {
        hwks = result[5];
        cmts = result[6];
      }

      res.render('lesson', {
        subtitle: '第' + lesson.order + '课时：' + lesson.title,
        lesson: lesson,
        course: course,
        cozwares: cozwares,
        lessonhwks: hwks,
        lessoncmts: cmts,
        isAuthor: isAuthor
      });
    })
    .catch(next);
});

// GET /course/:courseId/lesson/:lessonId/remove 删除课程内容
router.get('/:courseId/lesson/:lessonId/remove', checkLogin, function (req, res, next) {
  var courseId = req.params.courseId;
  var user = req.session.user;
  var lessonId = req.params.lessonId;

  Promise.all([
      CourseModel.getCourseById(courseId),
      LessonModel.getLessonById(lessonId)
    ])
    .then(function (result) {
      var course = result[0];
      var lesson = result[1]

      try {
        if (!course) {
          throw new Error('该课程不存在');
        }
        if (!lesson) {
          throw new Error('该课程内容不存在');
        }
        if (user && lesson.author && user._id.toString() !== lesson.author._id.toString()) {
          throw new Error('权限不足');
        }
      } catch (e) {
        req.flash('error', e.message);
        return res.redirect(`/course/${courseId}/lesson/${lessonId}`);
      }

      LessonModel.delLessonById(lessonId, user._id)
        .then(function () {
          req.flash('success', '删除课程内容成功');
          return res.redirect(`/course/${courseId}`);
        });
    })
    .catch(next);
});

// GET /course/:courseId/lesson/:lessonId/edit 更新课程内容页
router.get('/:courseId/lesson/:lessonId/edit', checkLogin, function (req, res, next) {
  var courseId = req.params.courseId;
  var lessonId = req.params.lessonId;
  var user = req.session.user;

  Promise.all([
      CourseModel.getCourseById(courseId),
      LessonModel.getRawLessonById(lessonId)
    ])
    .then(function (result) {
      var course = result[0];
      var lesson = result[1];

      try {
        if (!course) {
          throw new Error('该课程不存在');
        }
        if (!lesson) {
          throw new Error('该课程内容不存在');
        }
        if (user && lesson.author && user._id.toString() !== lesson.author._id.toString()) {
          throw new Error('权限不足');
        }
      } catch (e) {
        req.flash('error', e.message);
        return res.redirect(`/course/${courseId}/lesson/${lessonId}`);
      }

      res.render('editlesson', {
        subtitle: course.title + ' - 编辑课程内容',
        lesson: lesson
      });
    })
    .catch(next);
});

// POST /course/:courseId/lesson/:lessonId/edit 更新课程内容
router.post('/:courseId/lesson/:lessonId/edit', checkLogin, function (req, res, next) {
  var courseId = req.params.courseId;
  var lessonId = req.params.lessonId;
  var order = req.fields.order;
  var title = req.fields.title;
  var content = req.fields.content;
  var user = req.session.user;

  try {
    if (!order.length) {
      throw new Error('课时不能为空');
    }
    if (order <= 0) {
      throw new Error('课时只能为正整数');
    }
    if (order > 200) {
      throw new Error('课时数超过限制');
    }
    if (!(title.length >= 1 && title.length <= 50)) {
      throw new Error('标题字数限制为1-50');
    }
    if (!(content.length >= 100 && content.length <= 10000)) {
      throw new Error('内容字数限制为100-10000');
    }
  } catch (e) {
    req.flash('error', e.message);
    return res.redirect('back');
  }

  LessonModel.updateLessonById(lessonId, user._id, { order: order, title: title, content: content })
    .then(function () {
      req.flash('success', '编辑课程内容成功');
      return res.redirect(`/course/${courseId}/lesson/${lessonId}`);
    })
    .catch(next);
});

// POST /course/:courseId/lesson/:lessonId/cozware 教师上传课件
router.post('/:courseId/lesson/:lessonId/cozware', checkLogin, function (req, res, next) {
  var author = req.session.user._id;
  var courseId = req.params.courseId;
  var lessonId = req.params.lessonId;
  // split(path.sep) 将路径转化为数组对象，pop() 取文件上传后的文件名（不包括前面路径）
  var cwpath = req.files.cozware.path.split(path.sep).pop();
  var fname = cwpath.split('.');

  try {
    if (!req.files.cozware.name) {
      throw new Error('缺少文件');
    }
    if (['ppt', 'pptx', 'doc', 'docx','pdf', 'txt','rar'].indexOf(fname[fname.length - 1]) === -1) {
      throw new Error('文件格式只能为ppt、doc、pdf、txt、rar或zip');
    }
    if (req.files.cozware.size === 0 || req.files.cozware.size > 10 * 1024 * 1024) {
      throw new Error('文件大小超过限制');
    }
  } catch (e) {
    // 上传课件失败，异步删除上传的文件
    fs.unlink(req.files.cozware.path);
    req.flash('error', e.message);
    return res.redirect('back');
  }

  var cozware = {
    lessonId: lessonId,
    courseId: courseId,
    author: author,
    path: cwpath,
    name: req.files.cozware.name
  };

  CozwareModel.create(cozware)
    .then(function () {
      req.flash('success', '课件上传成功');
      return res.redirect('back');
    })
    .catch(next);
});

// GET /course/:courseId/lesson/:lessonId/cozware/:cozwareId/remove 教师删除课件
router.get('/:courseId/lesson/:lessonId/cozware/:cozwareId/remove', checkLogin, function (req, res, next) {
  var cozwareId = req.params.cozwareId;
  var user = req.session.user;

  CozwareModel.getCozwareById(cozwareId)
    .then(function (cw) {
      try {
        if (user && cw.author && user._id.toString() !== cw.author.toString()) {
          throw new Error('权限不足');
        }
      } catch (e) {
        req.flash('error', e.message);
        return res.redirect('back');
      }

      CozwareModel.delCozwareById(cozwareId, user._id)
        .then(function () {
          var filepath = path.join(__dirname,'../public/upload/', cw.path);
          fs.unlink(filepath.toString());// 删除上传的文件

          req.flash('success', '删除课件成功');
          return res.redirect('back');
        });
    })
    .catch(next);
});

// GET /course/file/:filename 下载课件
router.get('/file/:fileName', checkLogin, function (req, res, next) {
  var fileName = req.params.fileName;
  var filePath = path.join(__dirname,'../public/upload/', fileName);
  var stats = fs.statSync(filePath);

  try {
    if (!stats.isFile()) {
      throw new Error('文件不存在');
    }
  } catch(e) {
    req.flash('error', e.message);
    return res.redirect('back');
  }

  res.set({
    'Content-Type': 'application/octet-stream',
    'Content-Dispositon': 'attachment; filename = ' + fileName,
    'Content-Length': stats.size
  });
  fs.createReadStream(filePath).pipe(res);
});

// POST /course/:courseId/lesson/:lessonId/lessonhwk 学生上传作业
router.post('/:courseId/lesson/:lessonId/lessonhwk', checkLogin, function (req, res, next) {
  var author = req.session.user._id;
  var courseId = req.params.courseId;
  var lessonId = req.params.lessonId;
  // split(path.sep) 将路径转化为数组对象，pop() 取文件上传后的文件名（不包括前面路径）
  var hwkpath = req.files.lessonhwk.path.split(path.sep).pop();
  var fname = hwkpath.split('.');

  try {
    if (!req.files.lessonhwk.name) {
      throw new Error('缺少文件');
    }
    if (['ppt', 'pptx', 'doc', 'docx','pdf', 'txt','rar'].indexOf(fname[fname.length - 1]) === -1) {
      throw new Error('文件格式只能为ppt、doc、pdf、txt、rar或zip');
    }
    if (req.files.lessonhwk.size === 0 || req.files.lessonhwk.size > 10 * 1024 * 1024) {
      throw new Error('文件大小超过限制');
    }
  } catch (e) {
    // 上传课件失败，异步删除上传的文件
    fs.unlink(req.files.lessonhwk.path);
    req.flash('error', e.message);
    return res.redirect('back');
  }

  var lessonhwk = {
    lessonId: lessonId,
    courseId: courseId,
    author: author,
    path: hwkpath,
    name: req.files.lessonhwk.name
  };

  LessonhwkModel.create(lessonhwk)
    .then(function () {
      req.flash('success', '作业上传成功');
      return res.redirect('back');
    })
    .catch(next);
});

// GET /course/:courseId/lesson/:lessonId/lessonhwk/:lessonhwkId/remove 学生删除作业
router.get('/:courseId/lesson/:lessonId/lessonhwk/:lessonhwkId/remove', checkLogin, function (req, res, next) {
  var lessonhwkId = req.params.lessonhwkId;
  var user = req.session.user;

  LessonhwkModel.getLessonhwkById(lessonhwkId)
    .then(function (hwk) {
      try {
        if (!hwk) {
          throw new Error('该作业不存在');
        }
        if (user && hwk.author && user._id.toString() !== hwk.author.toString()) {
          throw new Error('权限不足');
        }
      } catch(e) {
        req.flash('error', e.message);
        return res.redirect('back');
      }

      LessonhwkModel.delLessonhwkById(lessonhwkId, user._id)
        .then(function () {
          var filepath = path.join(__dirname,'../public/upload/', hwk.path);
          fs.unlink(filepath.toString());// 删除上传的文件

          req.flash('success', '删除作业成功');
          return res.redirect('back');
        });
    })
    .catch(next);
});

// GET /course/file/:filename 教师或学生下载作业
router.get('/file/:fileName', checkLogin, function (req, res, next) {
  var fileName = req.params.fileName;
  var filePath = path.join(__dirname,'../public/upload/', fileName);
  var stats = fs.statSync(filePath);

  try {
    if (!stats.isFile()) {
      throw new Error('文件不存在');
    }
  } catch(e) {
    req.flash('error', e.message);
    return res.redirect('back');
  }

  res.set({
    'Content-Type': 'application/octet-stream',
    'Content-Dispositon': 'attachment; filename = ' + fileName,
    'Content-Length': stats.size
  });
  fs.createReadStream(filePath).pipe(res);
});

// POST /course/:courseId/lesson/:lessonId/lessoncmt 创建一条课程内容留言
router.post('/:courseId/lesson/:lessonId/lessoncmt', checkLogin, function(req, res, next) {
  var author = req.session.user._id;
  var courseId = req.params.courseId;
  var lessonId = req.params.lessonId;
  var content = req.fields.content;

  Promise.all([
      CourseModel.getCourseById(courseId),
      LessonModel.getLessonById(lessonId)
    ])
    .then(function (result) {
      var course = result[0];
      var lesson = result[1];

      try {
        if (!course) {
          throw new Error('该课程不存在');
        }
        if (!lesson) {
          throw new Error('该课程内容不存在');
        }
        if (!content.length) {
          throw new Error('请填写留言内容');
        }
        if (!(content.length >= 1 && content.length <= 500)) {
          throw new Error('留言字数限制为1-500');
        }
      } catch (e) {
        req.flash('error', e.message);
        return res.redirect('back');
      }

      var lessoncmt = {
        lessonId: lessonId,
        courseId: courseId,
        author: author,
        content: content
      };

      LessoncmtModel.create(lessoncmt)
        .then(function () {
          req.flash('success', '留言成功');
          // 留言成功后跳转到上一页
          return res.redirect('back');
        });
    })
    .catch(next);
});

// GET /course/:courseId/lesson/:lessonId/lessoncmt/:lessoncmtId/remove 删除一条课程内容留言
router.get('/:courseId/lesson/:lessonId/lessoncmt/:lessoncmtId/remove', checkLogin, function(req, res, next) {
  var lessoncmtId = req.params.lessoncmtId;
  var user = req.session.user;

  LessoncmtModel.getLessoncmtById(lessoncmtId)
    .then(function (cmt) {
      try {
        if (!cmt) {
          throw new Error('该留言不存在');
        }
        if (user && cmt.author && user._id.toString() !== cmt.author.toString()) {
          throw new Error('权限不足');
        }
      } catch(e) {
        req.flash('error', e.message);
        return res.redirect('back');
      }

      LessoncmtModel.delLessoncmtById(lessoncmtId, user._id)
        .then(function () {
          req.flash('success', '删除留言成功');
          // 删除成功后跳转到上一页
          return res.redirect('back');
        });
    })
    .catch(next);
});

// GET /course/:courseId/approve 课程通过审核
router.get('/:courseId/approve', checkLogin, function (req, res, next) {
  var userId = req.session.user._id;
  var courseId = req.params.courseId;

  Promise.all([
      UserModel.getUserById(userId),
      CourseModel.getCourseById(courseId)
    ])
    .then(function (result) {
      var user = result[0];
      var course = result[1];

      try {
        if (user.identity !== 'admin') {
          throw new Error('权限不足');
        }
        if (course.status !== '0') {
          throw new Error('该课程不需要审核');
        }
      } catch (e) {
        req.flash('error', e.message);
        return res.redirect('back');
      }
      
      CourseModel.updateStatusById(courseId)
        .then(function () {
          req.flash('success', '审核成功');
          return res.redirect('back');
        });
    })
    .catch(next);
});

module.exports = router;
