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
  delLessonhwkById: function delLessonhwkById(lessonhwkId, hwkauthor) {
    return Lessonhwk.remove({ _id: lessonhwkId, hwkauthor: hwkauthor }).exec();
  },

  // 根据课程 id 删除所有作业
  delLessonhwksByCourseId: function delLessonhwksByCourseId(courseId) {
    return Lessonhwk.remove({ courseId: courseId }).exec();
  },

  // 根据课程内容 id 删除所有作业
  delLessonhwksByLessonId: function delLessonhwksByLessonId(lessonId) {
    return Lessonhwk.remove({ lessonId: lessonId }).exec();
  },

  // 获取课程内容下的所有作业，按作业上交时间升序
  getLessonhwks: function getLessonhwks(lessonId) {
    return Lessonhwk
      .find({ lessonId: lessonId })
      .populate({ path: 'hwkauthor', model: 'User' })
      .populate({ path: 'lsnauthor', model: 'User' })
      .sort({ hwkauthor: 1, _id: 1 })
      .addCreatedAt()
      .exec();
  },

  // 根据用户 id 获取课程内容下该用户提交的所有作业，按作业上交时间升序
  getLessonhwksByUserId: function getLessonhwksByUserId(hwkauthor) {
    return Lessonhwk
      .find({ hwkauthor: hwkauthor })
      .populate({ path: 'hwkauthor', model: 'User' })
      .populate({ path: 'lsnauthor', model: 'User' })
      .sort({ _id: 1 })
      .addCreatedAt()
      .exec();
  },

  // 根据用户 id 获取该用户收到的所有作业，按作业上交时间升序
  getLessonhwksByLsnauthorId: function getLessonhwksByLsnauthorId(lsnauthor) {
    return Lessonhwk
      .find({ lsnauthor: lsnauthor })
      .populate({ path: 'hwkauthor', model: 'User' })
      .populate({ path: 'lsnauthor', model: 'User' })
      .populate({ path: 'lessonId', model: 'Lesson' })
      .sort({ _id: 1 })
      .addCreatedAt()
      .exec();
  },

  // 根据作业 id 获取作业
  getLessonhwkById: function getLessonhwkById(lessonhwkId) {
    return Lessonhwk
      .findOne({ _id: lessonhwkId })
      .addCreatedAt()
      .exec();
  },
  
  // 根据作业 id 将批复数+1
  incReply: function incReply(lessonhwkId) {
    return Lessonhwk
      .update({ _id: lessonhwkId }, { $inc: { reply: 1 } })
      .exec();
  }
};