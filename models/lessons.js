/**
 * Created by zhongjr on 2017/3/7.
 */

var marked = require('marked');
var Lesson = require('../lib/mongo').Lesson;
var CozwareModel = require('../models/cozwares');
var LessoncmtModel = require('../models/lessoncmts');
var LessonhwkModel = require('../models/lessonhwks');

// 将 lesson 的 content 从 markdown 转换成 html
Lesson.plugin('contentToHtml', {
  afterFind: function (lessons) {
    return lessons.map(function (lesson) {
      lesson.content = marked(lesson.content);
      return lesson;
    });
  },
  afterFindOne: function (lesson) {
    if (lesson) {
      lesson.content = marked(lesson.content);
    }
    return lesson;
  }
});

module.exports = {
  // 创建一个课程内容
  create: function create(lesson) {
    return Lesson.create(lesson).exec();
  },

  // 通过课程 id 获取该课程下所有课程内容，按课程次序升序
  getLessons: function getLessons(postId) {
    return Lesson
      .find({ postId: postId })
      .populate({ path: 'author', model: 'User' })
      .sort({ order: 1 })
      .addCreatedAt()
      .contentToHtml()
      .exec();
  },
  
  // 通过课程内容 id 获取该课程内容
  getLessonById: function getLessonById(lessonId) {
    return Lesson
      .findOne({ _id: lessonId })
      .populate({ path: 'author', model: 'User' })
      .addCreatedAt()
      .contentToHtml()
      .exec();
  },
  
  // 通过课程 id 获取原来课程内容（编辑课程内容）
  getRawLessonById: function getRawLessonById(lessonId) {
    return Lesson
      .findOne({ _id: lessonId })
      .populate({ path: 'author', model: 'User' })
      .exec();
  },

  // 通过课程 id 和课程内容 id 更新课程内容
  updateLessonById: function updateLessonById(postId, lessonId, data) {
    return Lesson.update({ postId: postId, _id: lessonId }, { $set: data }).exec();
  },

  // 通过用户 id 和课程内容 id 删除一个课程内容
  delLessonById: function delLessonById(lessonId, author) {
    return Lesson
      .remove({ _id: lessonId, author: author })
      .exec()
      .then(function (res) {
        if (res.result.ok && res.result.n > 0) {
          CozwareModel.delCozwaresByLessonId(lessonId);
          LessoncmtModel.delLessoncmtsByLessonId(lessonId);
          LessonhwkModel.delLessonhwksByLessonId(lessonId);
        }
      });
  },

  // 通过课程 id 删除该课程下所有课程内容
  delLessonsByPostId: function delLessonsByPostId(postId) {
    return Lesson.remove({ postId: postId }).exec();
  }
};
