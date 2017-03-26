var marked = require('marked');
var Comment = require('../lib/mongo').Comment;

// 将 comment 的 content 从 markdown 转换成 html
Comment.plugin('contentToHtml', {
  afterFind: function (comments) {
    return comments.map(function (comment) {
      comment.content = marked(comment.content);
      return comment;
    });
  }
});

module.exports = {
  // 创建一个留言
  create: function create(comment) {
    return Comment.create(comment).exec();
  },

  // 通过用户 id 和留言 id 删除一个留言
  delCommentById: function delCommentById(commentId, author) {
    return Comment.remove({ author: author, _id: commentId }).exec();
  },

  // 通过课程 id 删除该课程下所有留言
  delCommentsByCourseId: function delCommentsByCourseId(courseId) {
    return Comment.remove({ courseId: courseId }).exec();
  },

  // 通过课程 id 获取该课程下所有留言，按留言创建时间升序
  getComments: function getComments(courseId) {
    return Comment
      .find({ courseId: courseId })
      .populate({ path: 'author', model: 'User' })
      .sort({ _id: 1 })
      .addCreatedAt()
      .contentToHtml()
      .exec();
  },
  
  // 通过留言 id 获取该留言
  getCommentById: function getCommentById(commentId) {
    return Comment.findOne({ _id: commentId }).exec();
  },

  // 通过课程 id 获取该课程下留言数
  getCommentsCount: function getCommentsCount(courseId) {
    return Comment.count({ courseId: courseId }).exec();
  }
};
