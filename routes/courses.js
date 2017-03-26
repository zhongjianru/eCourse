/**
 * Created by 45925 on 2017/3/26.
 */

var express = require('express');
var router = express.Router();

var CourseModel = require('../models/courses');

// GET /courses 所有课程页
router.get('/', function(req, res, next) {
  //获取所有课程
  CourseModel.getCourses()
    .then(function (courses) {
      res.render('courses', {
        subtitle: 'scnu online',
        courses: courses
      });
    })
    .catch(next);
});

module.exports = router;
