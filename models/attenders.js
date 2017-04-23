/**
 * Created by zhongjr on 2017/1/11.
 */

var Attender = require('../lib/mongo').Attender;

module.exports = {
  // 创建一位课程参与者
  create: function create(attender) {
    return Attender.create(attender).exec();
  },
  // 通过用户 id 和参与者 id 删除一位课程参与者
  delAttenderById: function delAttenderById(attendId, attender) {
    return Attender.remove({ _id: attendId, attender: attender }).exec();
  },
  // 通过课程 id 删除该课程下的所有参与者
  delAttendersByCourseId: function delAttendersByCourseId(courseId) {
    return Attender.remove({ courseId: courseId }).exec();
  },
  // 通过课程 id 获取该课程的所有参与者，按参与时间升序
  getAttenders: function getAttenders(courseId) {
    return Attender
      .find({ courseId: courseId })
      .populate({ path: 'attender', model: 'User' })
      .sort({ _id: 1 })
      .addCreatedAt()
      .exec();
  },
  // 通过用户 id 获取用户加入的所有课程
  getCoursesByUserId: function getCoursessByUserId(userId) {
    return Attender
      .find({ attender: userId })
      .populate({ path: 'courseId', model: 'Course' })
      .populate({ path: 'author', model: 'User' })
      .populate({ path: 'attender', model: 'User' })
      .sort({ _id: 1 })
      .addCreatedAt()
      .exec();
  },
  // 通过用户 id 和 课程 id 获取用户是否已加入该课程
  isAttended: function isAttended(userId, courseId) {
    return Attender
      .findOne({ attender: userId, courseId: courseId })
      .addCreatedAt()
      .exec();
  },
  // 通过课程 id 获取该课程参与者人数
  getAttendersCount: function getAttendersCount(courseId) {
    return Attender.count({ courseId: courseId }).exec();
  }
};
