module.exports = function (app) {
  app.get('/', function (req, res) {
    res.redirect('/courses'); // 首页重定向到courses页面
  });
  app.use('/signup', require('./signup'));
  app.use('/signin', require('./signin'));
  app.use('/signout', require('./signout'));
  app.use('/courses', require('./courses'));
  app.use('/course', require('./course'));
  app.use('/user', require('./user'));

  // 404 page
  app.use(function (req, res) {
    if (!res.headersSent) {
      res.render('404');
    }
  });
};
