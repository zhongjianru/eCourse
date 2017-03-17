/**
 * Created by zhongjr on 2017/3/12.
 */

 var Cozware = require('../lib/mongo').Cozware;

module.exports = {
  // 上传课件
  create: function create(cozware) {
    return Cozware.create(cozware).exec();
  },

  // 根据课程内容 id 和课件 id 删除一个课件
  delCozwareById: function delCozwareById(lessonId, cozwareId) {
    return Cozware.remove({ lessonId: lessonId, _id: cozwareId }).exec();
  },

  // 根据课程 id 删除所有课件
  delCozwaresByPostId: function delCozwaresByPostId(postId) {
    return Cozware.remove({ postId: postId }).exec();
  },

  // 获取课程内容下的所有课件，按课件上传时间升序
  getCozwares: function getCozwares(lessonId) {
    return Cozware
      .find({ lessonId: lessonId })
      .sort({ _id: 1 })
      .exec();
  },

  // 根据课件 id 获取课件
  getCozwareById: function getCozwareById(cozwareId) {
    return Cozware.findOne({ _id: cozwareId }).exec();
  }
};