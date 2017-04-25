/**
 * Created by zhongjr on 2017/4/25.
 */

var Letter = require('../lib/mongo').Letter;

module.exports = {
  // 创建一条私信
  create: function create(letter) {
    return Letter.create(letter).exec();
  },

  // 通过用户 id 和私信 id 删除一条私信
  delLetterById: function delLetterById(letterId, author) {
    return Letter.remove({ _id: letterId, author: author }).exec();
  },

  // 通过私信 id 取该条私信
  getLetterById: function getLetterById(letterId) {
    return Letter.findOne({ _id: letterId }).exec();
  },

  // 通过用户 id 获取发出的所有私信，按私信创建时间升序
  getLettersByAuthor: function getLettersByAuthor(author) {
    return Letter
      .find({ author: author })
      .populate({ path: 'author', model: 'User' })
      .populate({ path: 'receiver', model: 'User' })
      .sort({ _id: 1 })
      .addCreatedAt()
      .exec();
  },

  // 通过用户 id 获取收到的所有私信，按私信创建时间升序
  getLettersByUserId: function getLettersByUserId(receiver) {
    return Letter
      .find({ receiver: receiver })
      .populate({ path: 'author', model: 'User' })
      .populate({ path: 'receiver', model: 'User' })
      .sort({ _id: 1 })
      .addCreatedAt()
      .exec();
  }
};
