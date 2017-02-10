var express = require('express');
var router = express.Router();

var UserModel = require('../models/users');
var PostModel = require('../models/posts');
var CommentModel = require('../models/comments');
var AttenderModel = require('../models/attenders');
var checkLogin = require('../middlewares/check').checkLogin;

// GET /posts 所有课程页或者特定用户的个人主页
// eg: GET /posts?author=xxx
router.get('/', function(req, res, next) {
  //所有课程页
  if(!req.query.author) {
    //获取所有课程
    PostModel.getPosts(null)
      .then(function (posts) {
        res.render('posts', {
          posts: posts,
          subtitle: 'scnu online'
        });
      })
      .catch(next);
  }
  //个人主页
  else {
    var author = req.query.author;// 获取url中的查询参数author
    Promise.all([
        UserModel.getUserById(author)
      ])
      .then(function (result) {
        var user = result[0];

        // 教师显示发布的课程，学生显示加入的课程
        if(user.identity === 'teacher') {
          PostModel.getPosts(author)
            .then(function (posts) {
              res.render('profile', {
                posts: posts,
                subtitle: user.name + ' - 个人主页',
                user: user
              });
            })
            .catch(next);
        }
        else {
          AttenderModel.getPostsByUserId(author)
          //PostModel.getPosts(author)
            .then(function (posts) {
              res.render('profile', {
                posts: posts,
                subtitle: user.name + ' - 个人主页',
                user: user
              });
            })
            .catch(next);
        }
      });
  }
});

// GET /posts/create 发表课程页
router.get('/create', checkLogin, function(req, res, next) {
  if(req.session.user.identity === 'teacher') {
    res.render('create', { subtitle: '发表课程' });
  }
  else {
    res.render('404');
  }
});

// POST /posts 发表课程
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
    if (!(content.length >= 1 && content.length <= 200)) {
      throw new Error('课程简介字数限制为1-200');
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
    atd: 0
  };

  PostModel.create(post)
    .then(function (result) {
      // 此 post 是插入 mongodb 后的值，包含 _id
      post = result.ops[0];
      req.flash('success', '发表成功');
      // 发表成功后跳转到该课程页
      res.redirect(`/posts/${post._id}`);
    })
    .catch(next);
});

// GET /posts/:postId 单独一篇的课程页
router.get('/:postId', function(req, res, next) {
  var postId = req.params.postId;
  
  Promise.all([
    PostModel.getPostById(postId),// 获取课程 id
    CommentModel.getComments(postId),// 获取该课程所有留言
    AttenderModel.getAttenders(postId),
    PostModel.incPv(postId)// pv 加 1
  ])
  .then(function (result) {
    var post = result[0];
    var comments = result[1];
    var attenders = result[2];
    if (!post) {
      throw new Error('该课程不存在');
    }

    res.render('post', {
      post: post,
      comments: comments,
      attenders: attenders,
      subtitle: post.title + ' - 课程页'
    });
  })
  .catch(next);
});

// GET /posts/:postId/edit 更新课程页
router.get('/:postId/edit', checkLogin, function(req, res, next) {
  var postId = req.params.postId;
  var author = req.session.user._id;

  PostModel.getRawPostById(postId)
    .then(function (post) {
      if (!post) {
        throw new Error('该课程不存在');
      }
      if (author.toString() !== post.author._id.toString()) {
        throw new Error('权限不足');
      }
      res.render('edit', {
        post: post,
        subtitle: post.title + ' - 修改课程'
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

  PostModel.updatePostById(postId, author, { title: title, content: content, type: type })
    .then(function () {
      req.flash('success', '编辑课程成功');
      // 编辑成功后跳转到上一页
      res.redirect(`/posts/${postId}`);
    })
    .catch(next);
});

// GET /posts/:postId/remove 删除一个课程
router.get('/:postId/remove', checkLogin, function(req, res, next) {
  var postId = req.params.postId;
  var author = req.session.user._id;

  PostModel.delPostById(postId, author)
    .then(function () {
      req.flash('success', '删除课程成功');
      // 删除成功后跳转到主页
      res.redirect('/posts');
    })
    .catch(next);
});

// POST /posts/:postId/comment 创建一条留言
router.post('/:postId/comment', checkLogin, function(req, res, next) {
  var author = req.session.user._id;
  var postId = req.params.postId;
  var content = req.fields.content;
  var comment = {
    author: author,
    postId: postId,
    content: content
  };

  CommentModel.create(comment)
    .then(function () {
      req.flash('success', '留言成功');
      // 留言成功后跳转到上一页
      res.redirect('back');
    })
    .catch(next);
});

// GET /posts/:postId/comment/:commentId/remove 删除一条留言
router.get('/:postId/comment/:commentId/remove', checkLogin, function(req, res, next) {
  var commentId = req.params.commentId;
  var author = req.session.user._id;

  CommentModel.delCommentById(commentId, author)
    .then(function () {
      req.flash('success', '删除留言成功');
      // 删除成功后跳转到上一页
      res.redirect('back');
    })
    .catch(next);
});

// POST /posts/:postId/attend 添加课程参与人
router.post('/:postId/attend', checkLogin, function(req, res, next) {
  try {
    if (req.session.user.identity === 'teacher') {
      throw new Error('教师不能加入课程');
    }
  } catch (e) {
    req.flash('error', e.message);
    return res.redirect('back');
  }

  var postId = req.params.postId;
  var userId = req.session.user._id;
  var userName = req.session.user.name;
  var attender = {
    postId: postId,
    userId: userId,
    userName: userName
  };

  AttenderModel.create(attender)
    .then(function () {
      req.flash('success', '加入课程成功');
      // 加入课程成功后跳转到上一页
      res.redirect('back');
    })
    .catch(next);
});

// GET /posts/:postId/attend
// /:attenderId/remove 删除课程参与人
router.get('/:postId/attend/:attenderId/remove', checkLogin, function (req, res, next) {
  var attenderId = req.params.attenderId;
  var attender = req.session.user._id;

  AttenderModel.delAttendById(attenderId, attender)
    .then(function () {
      req.flash('success', '退出课程成功');
      // 退出成功后跳转上一页
      res.redirect('back');
    })
    .catch(next);
});

module.exports = router;
