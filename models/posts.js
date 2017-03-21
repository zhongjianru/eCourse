var marked = require('marked');
var Post = require('../lib/mongo').Post;
var CommentModel = require('./comments');
var AttenderModel = require('./attenders');
var LessonModel = require('../models/lessons');
var CozwareModel = require('../models/cozwares');
var LessoncmtModel = require('../models/lessoncmts');
var LessonhwkModel = require('../models/lessonhwks');

// 给 post 添加留言数 commentsCount
Post.plugin('addCommentsCount', {
  afterFind: function (posts) {
    return Promise.all(posts.map(function (post) {
      return CommentModel.getCommentsCount(post._id).then(function (commentsCount) {
        post.commentsCount = commentsCount;
        return post;
      });
    }));
  },
  afterFindOne: function (post) {
    if (post) {
      return CommentModel.getCommentsCount(post._id).then(function (count) {
        post.commentsCount = count;
        return post;
      });
    }
    return post;
  }
});

// 给 post 添加课程参与人数 attendersCount
Post.plugin('addAttendersCount', {
  afterFind: function(posts) {
    return Promise.all(posts.map(function (post) {
      return AttenderModel.getAttendersCount(post._id).then(function (attendersCount) {
        post.attendersCount = attendersCount;
        return post;
      });
    }));
  },
  afterFindOne: function (post) {
    if(post) {
      return AttenderModel.getAttendersCount(post._id).then(function (count) {
        post.attendersCount = count;
        return post;
      });
    }
    return post;
  }
});

// 将 post 的 content 从 markdown 转换成 html
Post.plugin('contentToHtml', {
  afterFind: function (posts) {
    return posts.map(function (post) {
      post.content = marked(post.content);
      return post;
    });
  },
  afterFindOne: function (post) {
    if (post) {
      post.content = marked(post.content);
    }
    return post;
  }
});

module.exports = {
  // 创建课程
  create: function create(post) {
    return Post.create(post).exec();
  },

  // 通过课程 id 获取课程
  getPostById: function getPostById(postId) {
    return Post
      .findOne({ _id: postId })
      .populate({ path: 'author', model: 'User' })
      .addCreatedAt()
      .addAttendersCount()
      .addCommentsCount()
      .contentToHtml()
      .exec();
  },

  // 按创建时间降序获取所有已审核的课程
  getPosts: function getPosts() {
    return Post
      .find({ status: '1' })
      .populate({ path: 'author', model: 'User' })
      .sort({ _id: -1 })
      .addCreatedAt()
      .addAttendersCount()
      .addCommentsCount()
      .contentToHtml()
      .exec();
  },

  // 按创建时间降序获取所有未审核的课程
  getRejectedPosts: function getRejectedPosts() {
    return Post
      .find({ status: '0' })
      .populate({ path: 'author', model: 'User' })
      .sort({ _id: -1 })
      .addCreatedAt()
      .addAttendersCount()
      .addCommentsCount()
      .contentToHtml()
      .exec();
  },

  // 通过用户 id 获取该用户发表的已审核的课程
  getPostsByUserId: function getPostsByUserId(userId) {
    return Post
      .find({ author: userId, status: '1' })
      .populate({ path: 'author', model: 'User' })
      .sort({ _id: -1 })
      .addCreatedAt()
      .addAttendersCount()
      .addCommentsCount()
      .contentToHtml()
      .exec();
  },

  // 通过用户 id 获取该用户发表的未审核的课程
  getRejectedPostsByUserId: function getRejectedPostsByUserId(userId) {
    return Post
      .find({ author: userId, status: '0' })
      .populate({ path: 'author', model: 'User' })
      .sort({ _id: -1 })
      .addCreatedAt()
      .addAttendersCount()
      .addCommentsCount()
      .contentToHtml()
      .exec();
  },

  // 通过课程 id 给 pv 加 1
  incPv: function incPv(postId) {
    return Post
      .update({ _id: postId }, { $inc: { pv: 1 } })
      .exec();
  },
  
  // 通过课程 id 给 cmt 加 1
  incCmt: function incCmt(postId) {
    return Post
      .update({ _id: postId }, { $inc: { cmt: 1 } })
      .exec();
  },
  
  // 通过课程 id 给 atd 加 1
  incAtd: function incAtd(postId) {
    return Post
      .update({ _id: postId }, { $inc: { atd: 1 } })
      .exec();
  },

  // 通过课程 id 给 cmt 减 1
  decCmt: function decCmt(postId) {
    return Post
      .update({ _id: postId }, { $inc: { cmt: -1 } })
      .exec();
  },

  // 通过课程 id 给 atd 减 1
  decAtd: function decAtd(postId) {
    return Post
      .update({ _id: postId }, { $inc: { atd: -1 } })
      .exec();
  },

  // 通过课程 id 获取原来课程内容（编辑课程）
  getRawPostById: function getRawPostById(postId) {
    return Post
      .findOne({ _id: postId })
      .populate({ path: 'author', model: 'User' })
      .exec();
  },

  // 通过用户 id 和课程 id 更新课程
  updatePostById: function updatePostById(postId, author, data) {
    return Post.update({ author: author, _id: postId }, { $set: data }).exec();
  },

  // 通过用户 id 和课程 id 删除课程
  delPostById: function delPostById(postId, author) {
    return Post
      .update({ author: author, _id: postId }, { status: '2' })
      .exec()
      .then(function (res) {
        // 课程删除后，删除该课程下的所有留言、参与者、课程内容、课件、学生作业、学生留言
        if (res.result.ok && res.result.n > 0) {
            CommentModel.delCommentsByPostId(postId);
            AttenderModel.delAttendersByPostId(postId);
            LessonModel.delLessonsByPostId(postId);
            CozwareModel.delCozwaresByPostId(postId);
            LessoncmtModel.delLessoncmtsByPostId(postId);
            LessonhwkModel.delLessonhwksByPostId(postId);
        }
      });
  }
};
