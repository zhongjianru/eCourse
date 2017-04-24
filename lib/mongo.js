var config = require('config-lite');
var Mongolass = require('mongolass');
var mongolass = new Mongolass();
mongolass.connect(config.mongodb);

var moment = require('moment');
var objectIdToTimestamp = require('objectid-to-timestamp');

// 根据 id 生成创建时间 created_at
mongolass.plugin('addCreatedAt', {
  afterFind: function (results) {
    results.forEach(function (item) {
      item.created_at = moment(objectIdToTimestamp(item._id)).format('YYYY-MM-DD HH:mm');
    });
    return results;
  },
  afterFindOne: function (result) {
    if (result) {
      result.created_at = moment(objectIdToTimestamp(result._id)).format('YYYY-MM-DD HH:mm');
    }
    return result;
  }
});

exports.User = mongolass.model('User', {
  name: { type: 'string' },
  username: { type: 'string' },
  password: { type: 'string' },
  avatar: { type: 'string' },
  identity: { type: 'string', enum: ['student', 'teacher', 'admin'] },
  school: { type: 'string' },
  bio: { type: 'string' },
  email: { type: 'string' }
});
exports.User.index({ username: 1 }, { unique: true }).exec();// 根据用户名找到用户，用户名全局唯一

exports.Course = mongolass.model('Course', {
  author: { type: Mongolass.Types.ObjectId },
  title: { type: 'string' },
  content: { type: 'string' },
  type: { type: 'string' },
  pv: { type: 'number' },   // 浏览数
  cmt: { type: 'number' },  // 评论数
  atd: { type: 'number' },  // 参与数
  status: { type: 'string', enum: ['0', '1', '2'] }// 课程状态：0未审核，1已审核，2已删除
});
exports.Course.index({ author: 1, _id: -1 }).exec();// 按创建时间降序查看教师的已发表课程列表

exports.Comment = mongolass.model('Comment', {
  courseId: { type: Mongolass.Types.ObjectId },
  author: { type: Mongolass.Types.ObjectId },
  content: { type: 'string' },
  toComment: { type: Mongolass.Types.ObjectId },
  toAuthor: { type: Mongolass.Types.ObjectId },
  toAuthorName: { type: 'string' },
  isFirst: { type: 'string', enum: ['1', '0'] }, // 是否为留言：1为留言，0为回复留言
  reply: { type: 'number' } // 回复次数
});
exports.Comment.index({ courseId: 1, _id: 1 }).exec();// 通过课程 id 获取该课程下所有留言，按留言创建时间升序
exports.Comment.index({ author: 1, _id: 1 }).exec();// 通过用户 id 和留言 id 删除一个留言

exports.Attender = mongolass.model('Attender', {
  courseId: { type: Mongolass.Types.ObjectId },
  author: { type: Mongolass.Types.ObjectId },
  attender: { type: Mongolass.Types.ObjectId }
});
exports.Attender.index({ courseId: 1, _id: 1 }).exec();// 通过课程 id 获取该课程的所有参与人，按参与时间升序
exports.Attender.index({ attender: 1, _id: 1}).exec();// 通过用户 id 和 参与记录 id 删除一个参与记录

exports.Lesson = mongolass.model('Lesson', {
  courseId: { type: Mongolass.Types.ObjectId },
  author: { type: Mongolass.Types.ObjectId },
  order: { type: 'string' },
  title: { type: 'string' },
  content: { type: 'string' }
});
exports.Lesson.index({ courseId: 1, order:1 }).exec();// 通过课程 id 获取该课程的所有内容，按内容次序升序

exports.Cozware = mongolass.model('Cozware', {
  lessonId: { type: Mongolass.Types.ObjectId },
  courseId: { type: Mongolass.Types.ObjectId },
  author: { type: Mongolass.Types.ObjectId },
  path: { type: 'string' },
  name: { type: 'string' }
});
exports.Cozware.index({ lessonId: 1, _id: 1 }).exec();// 通过课程内容 id 获取该课程内容的所有课件，按课件上传时间升序

exports.Lessonhwk = mongolass.model('Lessonhwk', {
  lessonId: { type: Mongolass.Types.ObjectId },
  courseId: { type: Mongolass.Types.ObjectId },
  hwkauthor: { type: Mongolass.Types.ObjectId },
  lsnauthor: { type: Mongolass.Types.ObjectId },
  path: { type: 'string' },
  name: { type: 'string' },
  reply: { type: 'number' }
});
exports.Lessonhwk.index({ lessonId: 1, _id: 1 }).exec();// 通过课程内容 id 获取该课程内容的所有作业，按作业上交时间升序

exports.Hwkreply = mongolass.model('Hwkreply', {
  lessonhwkId: { type: Mongolass.Types.ObjectId },
  lessonId: { type: Mongolass.Types.ObjectId },
  courseId: { type: Mongolass.Types.ObjectId },
  hwkauthor: { type: Mongolass.Types.ObjectId },
  lsnauthor: { type: Mongolass.Types.ObjectId },
  content: { type: 'string' }
});
exports.Hwkreply.index({ lessonhwkId: 1, _id: 1 }).exec();// 通过作业 id 获取该课程的所有批复，按作业上交时间升序

exports.Lessoncmt = mongolass.model('Lessoncmt', {
  lessonId: { type: Mongolass.Types.ObjectId },
  courseId: { type: Mongolass.Types.ObjectId },
  author: { type: Mongolass.Types.ObjectId },
  content: { type: 'string' }
});
exports.Lessoncmt.index({ lessonId: 1, _id: 1 }).exec();// 通过课程内容 id 获取该课程内容下所有留言，按留言创建时间升序
exports.Lessoncmt.index({ author: 1, _id: 1 }).exec();// 通过用户 id 和留言 id 删除一个留言

exports.Follow = mongolass.model('Follow', {
  following: { type: Mongolass.Types.ObjectId },
  userId: { type: Mongolass.Types.ObjectId }
});
exports.Follow.index({ following: 1, _id: 1 }).exec();// 通过用户 id 获取关注列表，按创建时间升序
exports.Follow.index({ userId: 1, following: 1 }).exec();// 通过用户 id 和被关注人 id 删除一个关注

exports.Letter = mongolass.model('Letter', {
  author: { type: Mongolass.Types.ObjectId },
  receiver: { type: Mongolass.Types.ObjectId },
  content: { type: 'string' }
});
exports.Letter.index({ author: 1, _id: 1 }).exec();// 通过用户 id 获取发出私信，按创建时间升序
exports.Letter.index({ receiver: 1, _id: 1 }).exec();// 通过用户 id 获取收到私信，按创建时间升序
