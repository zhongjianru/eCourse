var User = require('../lib/mongo').User;
var Following = require('../lib/mongo').Following;

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
  getFollowingsById: function getFollowingsById(userId) {
    return Following
      .find({ userId: userId })
      .populate({ path: 'userId', model: 'User' })
      .exec();
  },

  // 通过 用户 id 和关注人 id 添加一条新的关注
  addFollowing: function addFollowing(follow) {
    return Following.create(follow).exec();
  },
  
  delFollowing: function delFollowing(userId, following) {
    return Following.remove({ userId: userId, following: following }).exec();
  },

  isFollowing: function isFollowing(userId, following) {
    return Following.findOne({ userId: userId, following: following }).exec();
  }
};
