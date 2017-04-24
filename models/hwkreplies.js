/**
 * Created by zhongjr on 2017/3/16.
 */

var marked = require('marked');
var Lessoncmt = require('../lib/mongo').Hwkreply;

module.exports = {
  // 创建一个作业批复
  create: function create(lessoncmt) {
    return Lessoncmt.create(lessoncmt).exec();
  },

  // 通过用户 id 和作业批复 id 删除一个作业批复
  delHwkreplyById: function delHwkreplyById(lessoncmtId, hwkauthor) {
    return Lessoncmt.remove({ _id: lessoncmtId, hwkauthor: hwkauthor }).exec();
  },

  // 通过课程 id 删除该课程下所有作业批复
  delHwkrepliesByCourseId: function delHwkrepliesByCourseId(courseId) {
    return Lessoncmt.remove({ courseId: courseId }).exec();
  },

  // 通过课程内容 id 删除该课程下所有作业批复
  delHwkrepliesByLessonId: function delHwkrepliesByLessonId(lessonId) {
    return Lessoncmt.remove({ lessonId: lessonId }).exec();
  },

  // 通过作业批复 id 获取该作业批复
  getHwkreplyById: function getHwkreplyById(lessoncmtId) {
    return Lessoncmt.findOne({ _id: lessoncmtId }).exec();
  },

  // 通过课程内容 id 获取该课程内容下所有作业批复，按作业批复创建时间升序
  getHwkreplies: function getHwkreplies(lessonId) {
    return Lessoncmt
      .find({ lessonId: lessonId })
      .populate({ path: 'hwkauthor', model: 'User' })
      .populate({ path: 'lsnauthor', model: 'User' })
      .sort({ _id: 1 })
      .exec();
  },

  // 通过用户 id 获取该课程内容下所有该用户的作业批复，按作业批复创建时间升序
  getHwkrepliesByUserId: function getHwkrepliesByUserId(userId) {
    return Lessoncmt
      .find({ hwkauthor: userId })
      .populate({ path: 'hwkauthor', model: 'User' })
      .populate({ path: 'lsnauthor', model: 'User' })
      .sort({ _id: 1 })
      .exec();
  }
};
