var User = require('../lib/mongo').User;
var Follow = require('../lib/mongo').Follow;

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

  // 搜索用户名
  searchUsersByName: function searchUsersByName(name) {
    var regex = new RegExp(name, 'i');
    return User.find({ name: regex, identity: { $ne: 'admin' } }).exec();
  },
  
  // 通过用户 id 更新用户信息
  updateUserById: function updateUserById(userId, data) {
    return User.update({ _id: userId }, { $set: data }).exec();
  },

  // 通过用户名删除用户
  delUserByUsername: function delUserByUsername(username) {
    return User.remove({ username: username }).exec();
  },

  // 通过用户 id 获取所有关注人
  getFollowsById: function getFollowsById(userId) {
    return Follow
      .find({ userId: userId })
      .populate({ path: 'following', model: 'User' })
      .exec();
  },

  // 通过 用户 id 和关注人 id 添加一条新的关注
  addFollow: function addFollow(follow) {
    return Follow.create(follow).exec();
  },
  
  delFollow: function delFollow(userId, following) {
    return Follow.remove({ userId: userId, following: following }).exec();
  },

  isFollow: function isFollow(userId, following) {
    return Follow.findOne({ userId: userId, following: following }).exec();
  }
};
