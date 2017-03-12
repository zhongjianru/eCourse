/**
 * Created by zhongjr on 2017/3/7.
 */

var marked = require('marked');
var Lesson = require('../lib/mongo').Lesson;

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

  // 通过课程 id 和课程内容 id 删除一个课程内容
  delLessonById: function delLessonById(postId, lessonId) {
    return Lesson.remove({ postId: postId, _id: lessonId }).exec();
  },

  // 通过课程 id 删除该课程下所有课程内容
  delLessonsByPostId: function delLessonsByPostId(postId) {
    return Lesson.remove({ postId: postId }).exec();
  },

  // 通过课程 id 获取该课程下所有课程内容，按课程次序升序
  getLessons: function getLessons(postId) {
    return Lesson
      .find({ postId: postId })
      .sort({ order: 1 })
      .addCreatedAt()
      .contentToHtml()
      .exec();
  },
  
  // 通过课程内容 id 获取该课程内容
  getLessonById: function getLessonById(lessonId) {
    return Lesson
      .findOne({ _id: lessonId })
      .addCreatedAt()
      .contentToHtml()
      .exec();
  },
  
  // 通过课程 id 获取原来课程内容（编辑课程）
  getRawLessonById: function getRawLessonById(lessonId) {
    return Lesson
      .findOne({ _id: lessonId })
      .exec();
  },

  // 通过课程 id 和课程内容 id 更新课程内容
  updateLessonById: function updateLessonById(postId, lessonId, data) {
    return Lesson.update({ postId: postId, _id: lessonId }, { $set: data }).exec();
  }
};
