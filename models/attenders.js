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
  delAttenderByPostId: function delAttendByPostId(userId, attenderId) {
    return Attender.remove({ userId: userId, _id: attenderId });
  },
  // 通过课程 id 删除该课程下的所有参与者
  delAttendersByPostId: function delAttendersByPostId(postId) {
    return Attender.remove({ postId: postId }).exec();
  },
  // 通过课程 id 获取该课程的所有参与者，按参与时间升序
  getAttenders: function getAttenders(postId) {
    return Attender
      .find({ postId: postId })
      .populate({ path: 'userId', model: 'User' })
      .sort({ _id: 1 })
      .addCreatedAt()
      .exec();
  },
  // 通过用户 id 获取用户加入的所有课程
  getPostsByUserId: function getPostsByUserId(userId) {
    return Attender
      .find({ userId: userId })
      .populate({ path: 'postId', model: 'Post' })
      .populate({ path: 'authorId', model: 'User' })
      .populate({ path: 'userId', model: 'User' })
      .sort({ _id: 1 })
      .addCreatedAt()
      .exec();
  },
  // 通过课程 id 获取该课程参与者人数
  getAttendersCount: function getAttendersCount(postId) {
    return Attender.count({ postId: postId }).exec();
  }
};