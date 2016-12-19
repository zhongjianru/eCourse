module.exports = {
  port: 3000,
  session: {
    secret: 'eCourse',
    key: 'eCourse',
    maxAge: 2592000000
  },
  mongodb: 'mongodb://localhost:27017/eCourse'
};
