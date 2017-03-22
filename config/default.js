module.exports = {
  port: 3000,
  session: {
    secret: 'eCourse',
    key: 'eCourse',
    maxAge: 1000 * 60 * 60 * 3 // session 过期时间为 3 小时
  },
  mongodb: 'mongodb://localhost:27017/eCourse'
};
