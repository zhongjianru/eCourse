/**
 * Created by zhongjr on 2017/3/16.
 */

var marked = require('marked');
var Lessoncmt = require('../lib/mongo').Lessoncmt;

// 将 lessoncmt 的 content 从 markdown 转换成 html
Lessoncmt.plugin('contentToHtml', {
  afterFind: function (lessoncmts) {
    return lessoncmts.map(function (lessoncmt) {
      lessoncmt.content = marked(lessoncmt.content);
      return lessoncmt;
    });
  }
});

module.exports = {
  // 创建一个留言
  create: function create(lessoncmt) {
    return Lessoncmt.create(lessoncmt).exec();
  },

  // 通过用户 id 和留言 id 删除一个留言
  delLessoncmtById: function delLessoncmtById(lessoncmtId, author) {
    return Lessoncmt.remove({ author: author, _id: lessoncmtId }).exec();
  },

  // 通过课程 id 删除该课程下所有留言
  delLessoncmtsByPostId: function delLessoncmtsByPostId(postId) {
    return Lessoncmt.remove({ postId: postId }).exec();
  },

  // 通过课程内容 id 删除该课程下所有留言
  delLessoncmtsByLessonId: function delLessoncmtsByLessonId(lessonId) {
    return Lessoncmt.remove({ lessonId: lessonId }).exec();
  },

  // 通过课程内容 id 获取该课程内容下所有留言，按留言创建时间升序
  getLessoncmts: function getLessoncmts(lessonId) {
    return Lessoncmt
      .find({ lessonId: lessonId })
      .populate({ path: 'author', model: 'User' })
      .sort({ _id: 1 })
      .addCreatedAt()
      .contentToHtml()
      .exec();
  },

  // 通过用户 id 获取该课程内容下所有该用户的留言，按留言创建时间升序
  getLessoncmtsByUserId: function getLessoncmts(userId) {
    return Lessoncmt
      .find({ author: userId })
      .populate({ path: 'author', model: 'User' })
      .sort({ _id: 1 })
      .addCreatedAt()
      .contentToHtml()
      .exec();
  }
};
