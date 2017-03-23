var fs = require('fs');
var path = require('path');
var express = require('express');
var router = express.Router();

var UserModel = require('../models/users');
var PostModel = require('../models/posts');
var CommentModel = require('../models/comments');
var AttenderModel = require('../models/attenders');
var LessonModel = require('../models/lessons');
var CozwareModel = require('../models/cozwares');
var LessoncmtModel = require('../models/lessoncmts');
var LessonhwkModel = require('../models/lessonhwks');
var checkLogin = require('../middlewares/check').checkLogin;

// GET /posts 所有课程页
router.get('/', function(req, res, next) {
  //获取所有课程
  PostModel.getPosts()
    .then(function (posts) {
      res.render('posts', {
        subtitle: 'scnu online',
        posts: posts
      });
    })
    .catch(next);
});

// GET /posts/create 发布课程页
router.get('/create', checkLogin, function(req, res, next) {
  var user = req.session.user;

  UserModel.getUserById(user._id)
    .then(function (user) {
      try {
        if (user.identity === 'teacher' && user.status === '0') {
          throw new Error('未审核用户不能发表课程');
        }
        if (user.identity !== 'teacher') {
          throw new Error('权限不足');
        }
      } catch (e) {
        req.flash('error', e.message);
        return res.redirect('/posts');
      }
    });
    //.catch(next);

  res.render('create', { subtitle: '发布课程' });
});

// POST /posts 发布课程
router.post('/', checkLogin, function(req, res, next) {
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
    if (!(content.length >= 1 && content.length <= 500)) {
      throw new Error('课程简介字数限制为1-500');
    }
  } catch (e) {
    req.flash('error', e.message);
    return res.redirect('back');
  }

  var post = {
    author: author,
    title: title,
    content: content,
    type: type,
    pv: 0,
    cmt: 0,
    atd: 0,
    status: '0'
  };

  PostModel.create(post)
    .then(function (result) {
      // 此 post 是插入 mongodb 后的值，包含 _id
      post = result.ops[0];
      req.flash('success', '发布课程成功');
      // 发布成功后跳转到该课程页
      return res.redirect(`/posts/${post._id}`);
    })
    .catch(next);
});

// GET /posts/:postId 课程页
router.get('/:postId', function(req, res, next) {
  var postId = req.params.postId;
  var userId = '';
  if(req.session.user) {
    userId = req.session.user._id;
  }

  Promise.all([
      PostModel.getPostById(postId),// 获取课程
      CommentModel.getComments(postId),// 获取该课程所有留言
      AttenderModel.getAttenders(postId),// 获取该课程所有参与者
      AttenderModel.isAttended(userId, postId),// 获取当前用户是否已加入该课程
      LessonModel.getLessons(postId),// 获取该课程所有课程内容
      PostModel.incPv(postId)// pv 加 1
    ])
    .then(function (result) {
      var post = result[0];
      var comments = result[1];
      var attendances = result[2];
      var isAttended = result[3];
      var lessons = result[4];

      try {
        if (!post) {
          throw new Error('该课程不存在');
        }
      } catch (e) {
        req.flash('error', e.message);
        return res.redirect('/posts');
      }

      res.render('post', {
        subtitle: post.title + ' - 课程页',
        post: post,
        comments: comments,
        attendances: attendances,
        isAttended: isAttended,
        lessons: lessons
      });
    })
    .catch(next);
});

// GET /posts/:postId/edit 更新课程页
router.get('/:postId/edit', checkLogin, function(req, res, next) {
  var postId = req.params.postId;
  var user = req.session.user;

  PostModel.getRawPostById(postId)
    .then(function (post) {
      try {
        if (!post) {
          throw new Error('该课程不存在');
        }
        if (user && post.author && user._id.toString() !== post.author._id.toString()) {
          throw new Error('权限不足');
        }
      } catch (e) {
        req.flash('error', e.message);
        return res.redirect(`/posts/${postId}`);
      }

      res.render('edit', {
        subtitle: post.title + ' - 修改课程',
        post: post
      });
    })
    .catch(next);
});

// POST /posts/:postId/edit 更新课程
router.post('/:postId/edit', checkLogin, function(req, res, next) {
  var postId = req.params.postId;
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
    if (!(content.length >= 1 && content.length <= 500)) {
      throw new Error('课程简介字数限制为1-500');
    }
  } catch (e) {
    req.flash('error', e.message);
    return res.redirect('back');
  }

  PostModel.updatePostById(postId, author, { title: title, content: content, type: type })
    .then(function () {
      req.flash('success', '编辑课程成功');
      // 编辑成功后跳转到上一页
      return res.redirect(`/posts/${postId}`);
    })
    .catch(next);
});

// GET /posts/:postId/remove 删除课程
router.get('/:postId/remove', checkLogin, function(req, res, next) {
  var postId = req.params.postId;
  var user = req.session.user;

  PostModel.getPostById(postId)
    .then(function (post) {
      try {
        if (!post) {
          throw new Error('该课程不存在');
        }
        if (user && post.author && user._id.toString() !== post.author._id.toString()) {
          throw new Error('权限不足');
        }
      } catch (e) {
        req.flash('error', e.message);
        return res.redirect(`/posts/${postId}`);
      }

      PostModel.delPostById(postId, user._id)
        .then(function () {
          req.flash('success', '删除课程成功');
          // 删除成功后跳转到主页
          return res.redirect('/posts');
        });
    })
    .catch(next);
});

// POST /posts/:postId/comment 创建一条留言
router.post('/:postId/comment', checkLogin, function(req, res, next) {
  var author = req.session.user._id;
  var postId = req.params.postId;
  var content = req.fields.content;

  PostModel.getPostById(postId)
    .then(function (post) {
      // 校验参数
      try {
        if (!post) {
          throw new Error('该课程不存在');
        }
        if (post.status === '0') {
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
        postId: postId,
        content: content
      };

      CommentModel.create(comment)
        .then(function () {
          PostModel.incCmt(postId);
          req.flash('success', '留言成功');
          // 留言成功后跳转到上一页
          return res.redirect('back');
        });
    })
    .catch(next);
});

// GET /posts/:postId/comment/:commentId/remove 删除一条留言
router.get('/:postId/comment/:commentId/remove', checkLogin, function(req, res, next) {
  var postId = req.params.postId;
  var commentId = req.params.commentId;
  var user = req.session.user;

  CommentModel.getCommentById(commentId)
    .then(function (comment) {
      try {
        if (!comment) {
          throw new Error('该留言不存在');
        }
        if (user && comment.author && user._id.toString() !== comment.author.toString()) {
          throw new Error('权限不足');
        }
      } catch (e) {
        req.flash('error', e.message);
        return res.redirect(`/posts/${postId}`);
      }

      CommentModel.delCommentById(commentId, user._id)
        .then(function () {
          PostModel.decCmt(postId);
          req.flash('success', '删除留言成功');
          // 删除成功后跳转到上一页
          return res.redirect('back');
        });
    })
    .catch(next);
});

// POST /posts/:postId/attend 添加课程参与人
router.post('/:postId/attend', checkLogin, function(req, res, next) {
  var postId = req.params.postId;
  var user = req.session.user;

  PostModel.getPostById(postId)
    .then(function (post) {
      try {
        if(!post) {
          throw new Error('该课程不存在');
        }
        if (post.status === '0') {
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
        postId: postId,
        author: post.author._id,
        attender: user._id
      };

      AttenderModel.create(attender)
        .then(function () {
          PostModel.incAtd(postId);
          req.flash('success', '加入课程成功');
          // 加入课程成功后跳转到上一页
          return res.redirect('back');
        });
    })
    .catch(next);
});

// GET /posts/:postId/attend/:attendId/remove 删除课程参与人
router.get('/:postId/attend/:attendId/remove', checkLogin, function (req, res, next) {
  var postId = req.params.postId;
  var attendId = req.params.attendId;
  var user = req.session.user;

  Promise.all([
      PostModel.getPostById(postId),
      AttenderModel.isAttended(user._id, postId)
    ])
    .then(function (result) {
      var post = result[0];
      var isAttend = result[1];

      try {
        if (!post) {
          throw new Error('该课程不存在');
        }
        if (!isAttend) {
          throw new Error('权限不足');
        }
      } catch (e) {
        req.flash('error', e.message);
        return res.redirect(`/posts/${postId}`);
      }

      AttenderModel.delAttenderById(attendId, user._id)
        .then(function () {
          PostModel.decAtd(postId);
          req.flash('success', '退出课程成功');
          // 退出课程成功后跳转到上一页
          return res.redirect('back');
        });
    })
    .catch(next);
});

// GET /posts/:postId/lesson 添加课程内容页
router.get('/:postId/lesson', checkLogin, function(req, res, next) {
  var postId = req.params.postId;
  var user = req.session.user;

  PostModel.getPostById(postId)
    .then(function (post) {
      try {
        if (!post) {
          throw new Error('该课程不存在');
        }
        if (post.status === '0') {
          throw new Error('该课程未通过审核');
        }
        if (user._id.toString() !== post.author._id.toString()) {
          throw new Error('权限不足');
        }
      } catch (e) {
        req.flash('error', e.message);
        return res.redirect(`/posts/${postId}`);
      }

      res.render('addlesson', {
        subtitle: '添加课程内容',
        postId: postId
      });
    })
    .catch(next);
});

// POST /posts/:postId/lesson 添加课程内容
router.post('/:postId/lesson', checkLogin, function (req, res, next) {
  var author = req.session.user._id;
  var postId = req.params.postId;
  var order = req.fields.order;
  var title = req.fields.title;
  var content = req.fields.content;

  try {
    if(!order.length) {
      throw new Error('课时不能为空');
    }
    if(order <= 0) {
      throw new Error('课时只能为正整数');
    }
    if(order > 100) {
      throw new Error('课时数限制为1-100');
    }
    if(!(title.length >= 1 && title.length <= 50)) {
      throw new Error('标题字数限制为1-50');
    }
    if(!content.length) {
      throw new Error('内容不能为空');
    }
    if(content.length > 10000) {
      throw new Error('内容字数限制为1-10000');
    }
  } catch (e) {
    req.flash('error', e.message);
    return res.redirect('back');
  }

  var lesson = {
    postId: postId,
    author: author,
    order: order,
    title: title,
    content: content
  };

  LessonModel.create(lesson)
    .then(function () {
      req.flash('success', '添加课程内容成功');
      // 添加课程内容成功后跳转到上一页
      return res.redirect(`/posts/${postId}`);
    })
    .catch(next);
});

// GET /posts/:postId/lesson/:lessonId 课程内容页
router.get('/:postId/lesson/:lessonId', function (req, res, next) {
  var postId = req.params.postId;
  var lessonId = req.params.lessonId;
  var user = req.session.user;
  var hwks = [];
  var cmts = [];

  Promise.all([
      LessonModel.getLessonById(lessonId),
      PostModel.getPostById(postId),
      CozwareModel.getCozwares(lessonId),
      LessonhwkModel.getLessonhwks(lessonId),// 教师显示所有学生的作业
      LessoncmtModel.getLessoncmts(lessonId),// 教师显示所有学生的留言
      LessonhwkModel.getLessonhwksByUserId(user._id),// 学生显示自己的作业
      LessoncmtModel.getLessoncmtsByUserId(user._id) // 学生显示自己的留言
    ])
    .then(function (result) {
      var lesson = result[0];
      var post = result[1];
      var cozwares = result[2];

      if(user.identity === 'student') {
        hwks = result[5];
        cmts = result[6];
      }
      else {
        hwks = result[3];
        cmts = result[4];
      }

      res.render('lesson', {
        subtitle: '第' + lesson.order + '课时：' + lesson.title,
        lesson: lesson,
        post: post,
        cozwares: cozwares,
        lessonhwks: hwks,
        lessoncmts: cmts,
      });
    })
    .catch(next);
});

// GET /posts/:postId/lesson/:lessonId/remove 删除课程内容
router.get('/:postId/lesson/:lessonId/remove', checkLogin, function (req, res, next) {
  var postId = req.params.postId;
  var user = req.session.user;
  var lessonId = req.params.lessonId;

  Promise.all([
      PostModel.getPostById(postId),
      LessonModel.getLessonById(lessonId)
    ])
    .then(function (result) {
      var post = result[0];
      var lesson = result[1]

      try {
        if (!post) {
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
        return res.redirect(`/posts/${postId}/lesson/${lessonId}`);
      }

      LessonModel.delLessonById(lessonId, user._id)
        .then(function () {
          req.flash('success', '删除课程内容成功');
          return res.redirect(`/posts/${postId}`);
        });
    })
    .catch(next);
});

// GET /posts/:postId/lesson/:lessonId/edit 更新课程内容页
router.get('/:postId/lesson/:lessonId/edit', checkLogin, function (req, res, next) {
  var postId = req.params.postId;
  var lessonId = req.params.lessonId;
  var user = req.session.user;

  Promise.all([
      PostModel.getPostById(postId),
      LessonModel.getRawLessonById(lessonId)
    ])
    .then(function (result) {
      var post = result[0];
      var lesson = result[1];

      try {
        if (!post) {
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
        return res.redirect(`/posts/${postId}/lesson/${lessonId}`);
      }

      res.render('editlesson', {
        subtitle: post.title + ' - 编辑课程内容',
        lesson: lesson
      });
    })
    .catch(next);
});

// POST /posts/:postId/lesson/:lessonId/edit 更新课程内容
router.post('/:postId/lesson/:lessonId/edit', checkLogin, function (req, res, next) {
  var postId = req.params.postId;
  var lessonId = req.params.lessonId;
  var order = req.fields.order;
  var title = req.fields.title;
  var content = req.fields.content;

  try {
    if(!order.length) {
      throw new Error('课时不能为空');
    }
    if(order <= 0) {
      throw new Error('课时只能为正整数');
    }
    if(order > 100) {
      throw new Error('课时数超过限制');
    }
    if(!(title.length >= 1 && title.length <= 50)) {
      throw new Error('标题字数限制为1-50');
    }
    if(!content.length) {
      throw new Error('内容不能为空');
    }
    if(content.length > 10000) {
      throw new Error('内容字数限制为1-10000');
    }
  } catch (e) {
    req.flash('error', e.message);
    return res.redirect('back');
  }

  LessonModel.updateLessonById(postId, lessonId, { order: order, title: title, content: content })
    .then(function () {
      req.flash('success', '编辑课程内容成功');
      return res.redirect(`/posts/${postId}/lesson/${lessonId}`);
    })
    .catch(next);
});

// POST //posts/:postId/lesson/:lessonId/cozware 教师上传课件
router.post('/:postId/lesson/:lessonId/cozware', checkLogin, function (req, res, next) {
  var author = req.session.user._id;
  var postId = req.params.postId;
  var lessonId = req.params.lessonId;
  // split(path.sep) 将路径转化为数组对象，pop() 取文件上传后的文件名（不包括前面路径）
  var cwpath = req.files.cozware.path.split(path.sep).pop();
  var fname = cwpath.split('.');

  try {
    if (!req.files.cozware.name) {
      throw new Error('缺少文件');
    }
    if(['ppt', 'pptx', 'doc', 'docx','pdf', 'txt','rar'].indexOf(fname[fname.length - 1]) === -1) {
      throw new Error('文件格式只能为ppt、doc、pdf、txt、rar或zip');
    }
    if(req.files.cozware.size === 0 || req.files.cozware.size > 10 * 1024 * 1024) {
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
    postId: postId,
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

// GET /posts/:postId/lesson/:lessonId/cozware/:cozwareId/remove 教师删除课件
router.get('/:postId/lesson/:lessonId/cozware/:cozwareId/remove', checkLogin, function (req, res, next) {
  var cozwareId = req.params.cozwareId;
  var user = req.session.user;

  CozwareModel.getCozwareById(cozwareId)
    .then(function (cw) {
      try {
        if(user && cw.author && user._id.toString() !== cw.author._id.toString()) {
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

// GET /posts/file/:filename 下载课件
router.get('/file/:fileName', checkLogin, function (req, res, next) {
  var fileName = req.params.fileName;
  var filePath = path.join(__dirname,'../public/upload/', fileName);
  var stats = fs.statSync(filePath);

  try {
    if(!stats.isFile()) {
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

// POST //posts/:postId/lesson/:lessonId/lessonhwk 学生上传作业
router.post('/:postId/lesson/:lessonId/lessonhwk', checkLogin, function (req, res, next) {
  var author = req.session.user._id;
  var postId = req.params.postId;
  var lessonId = req.params.lessonId;
  // split(path.sep) 将路径转化为数组对象，pop() 取文件上传后的文件名（不包括前面路径）
  var hwkpath = req.files.lessonhwk.path.split(path.sep).pop();
  var fname = hwkpath.split('.');

  try {
    if (!req.files.lessonhwk.name) {
      throw new Error('缺少文件');
    }
    if(['ppt', 'pptx', 'doc', 'docx','pdf', 'txt','rar'].indexOf(fname[fname.length - 1]) === -1) {
      throw new Error('文件格式只能为ppt、doc、pdf、txt、rar或zip');
    }
    if(req.files.lessonhwk.size === 0 || req.files.lessonhwk.size > 10 * 1024 * 1024) {
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
    postId: postId,
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

// GET /posts/:postId/lesson/:lessonId/lessonhwk/:lessonhwkId/remove 学生删除作业
router.get('/:postId/lesson/:lessonId/lessonhwk/:lessonhwkId/remove', checkLogin, function (req, res, next) {
  var lessonhwkId = req.params.lessonhwkId;
  var user = req.session.user;

  LessonhwkModel.getLessonhwkById(lessonhwkId)
    .then(function (hwk) {
      try {
        if(!hwk) {
          throw new Error('该作业不存在');
        }
        if(user && hwk.author && user._id.toString() !== hwk.author.toString()) {
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

// GET /posts/file/:filename 教师或学生下载作业
router.get('/file/:fileName', checkLogin, function (req, res, next) {
  var fileName = req.params.fileName;
  var filePath = path.join(__dirname,'../public/upload/', fileName);
  var stats = fs.statSync(filePath);

  try {
    if(!stats.isFile()) {
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

// POST /posts/:postId/lesson/:lessonId/lessoncmt 创建一条课程内容留言
router.post('/:postId/lesson/:lessonId/lessoncmt', checkLogin, function(req, res, next) {
  var author = req.session.user._id;
  var postId = req.params.postId;
  var lessonId = req.params.lessonId;
  var content = req.fields.content;

  Promise.all([
      PostModel.getPostById(postId),
      LessonModel.getLessonById(lessonId)
    ])
    .then(function (result) {
      var post = result[0];
      var lesson = result[1];

      try {
        if(!post) {
          throw new Error('该课程不存在');
        }
        if(!lesson) {
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
        postId: postId,
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

// GET /posts/:postId/lesson/:lessonId/lessoncmt/:lessoncmtId/remove 删除一条课程内容留言
router.get('/:postId/lesson/:lessonId/lessoncmt/:lessoncmtId/remove', checkLogin, function(req, res, next) {
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

module.exports = router;
