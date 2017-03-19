/**
 * Created by zhongjr on 2017/3/16.
 */

 var Lessonhwk = require('../lib/mongo').Lessonhwk;

module.exports = {
  // 上传课件
  create: function create(lessonhwk) {
    return Lessonhwk.create(lessonhwk).exec();
  },

  // 根据用户 id 和作业 id 删除一个作业
  delLessonhwkById: function delLessonhwkById(lessonhwkId, author) {
    return Lessonhwk.remove({ _id: lessonhwkId, author: author }).exec();
  },

  // 根据课程 id 删除所有作业
  delLessonhwksByPostId: function delLessonhwksByPostId(postId) {
    return Lessonhwk.remove({ postId: postId }).exec();
  },

  // 根据课程内容 id 删除所有作业
  delLessonhwksByLessonId: function delLessonhwksByLessonId(lessonId) {
    return Lessonhwk.remove({ lessonId: lessonId }).exec();
  },

  // 获取课程内容下的所有作业，按作业上交时间升序
  getLessonhwks: function getLessonhwks(lessonId) {
    return Lessonhwk
      .find({ lessonId: lessonId })
      .sort({ _id: 1 })
      .exec();
  },

  // 根据用户 id 获取课程内容下该用户的所有作业，按作业上交时间升序
  getLessonhwksByUserId: function getLessonhwks(userId) {
    return Lessonhwk
      .find({ author: userId })
      .sort({ _id: 1 })
      .exec();
  },

  // 根据课件 id 获取课件
  getLessonhwkById: function getLessonhwkById(lessonhwkId) {
    return Lessonhwk.findOne({ _id: lessonhwkId }).exec();
  }
};