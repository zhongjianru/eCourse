/**
 * Created by zhongjr on 2017/4/23.
 */

var Hwkreply = require('../lib/mongo').Hwkreply;

module.exports = {
  // 创建一个作业批复
  create: function create(hwkreply) {
    return Hwkreply.create(hwkreply).exec();
  },

  // 通过用户 id 和作业批复 id 删除一个作业批复
  delHwkreplyById: function delHwkreplyById(hwkreplyId, lsnauthor) {
    return Hwkreply.remove({ _id: hwkreplyId, lsnauthor: lsnauthor }).exec();
  },

  // 通过课程 id 删除该课程下所有作业批复
  delHwkrepliesByCourseId: function delHwkrepliesByCourseId(courseId) {
    return Hwkreply.remove({ courseId: courseId }).exec();
  },

  // 通过课程内容 id 删除该课程下所有作业批复
  delHwkrepliesByLessonId: function delHwkrepliesByLessonId(lessonId) {
    return Hwkreply.remove({ lessonId: lessonId }).exec();
  },

  // 通过作业批复 id 获取该作业批复
  getHwkreplyById: function getHwkreplyById(hwkreplyId) {
    return Hwkreply
      .findOne({ _id: hwkreplyId })
      .addCreatedAt()
      .exec();
  },

  // 通过课程内容 id 获取该课程内容下所有作业批复，按作业批复创建时间升序
  getHwkreplies: function getHwkreplies(lessonId) {
    return Hwkreply
      .find({ lessonId: lessonId })
      .populate({ path: 'hwkauthor', model: 'User' })
      .populate({ path: 'lsnauthor', model: 'User' })
      .addCreatedAt()
      .sort({ _id: 1 })
      .exec();
  },

  // 通过用户 id 获取该课程内容下所有该用户的作业批复，按作业批复创建时间升序
  getHwkrepliesByUserId: function getHwkrepliesByUserId(userId) {
    return Hwkreply
      .find({ hwkauthor: userId })
      .populate({ path: 'hwkauthor', model: 'User' })
      .populate({ path: 'lsnauthor', model: 'User' })
      .populate({ path: 'lessonId', model: 'Lesson' })
      .addCreatedAt()
      .sort({ _id: 1 })
      .exec();
  }
};
