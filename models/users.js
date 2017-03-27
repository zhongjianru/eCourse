var User = require('../lib/mongo').User;

module.exports = {
  // 注册一个用户
  create: function create(user) {
    return User.create(user).exec();
  },

  // 通过用户名获取用户信息
  getUserByUsername: function getUserByUsername(username) {
    return User
      .findOne({ username: username })
      .addCreatedAt()
      .exec();
  },

  // 通过用户 id 获取用户信息
  getUserById: function getUserById(userId) {
    return User
      .findOne({ _id: userId })
      .addCreatedAt()
      .exec();
  },
  
  // 通过用户 id 更新用户信息
  updateUserById: function updateUserById(userId, data) {
    return User.update({ _id: userId }, { $set: data }).exec();
  }
};
