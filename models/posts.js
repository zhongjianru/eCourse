var marked = require('marked');
var Post = require('../lib/mongo').Post;
var CommentModel = require('./comments');
var AttenderModel = require('./attenders');

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

  // 通过课程 id 获取课程内容
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

  // 按创建时间降序获取所有课程或者某个特定用户的所有课程
  getPosts: function getPosts(author) {
    var query = {};
    if (author) {
      query.author = author;
    }
    return Post
      .find(query)
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
    return Post.remove({ author: author, _id: postId })
      .exec()
      .then(function (res) {
        // 文章删除后，再删除该文章下的所有留言
        if (res.result.ok && res.result.n > 0) {
          return CommentModel.delCommentsByPostId(postId);
        }
      });
  }
};
