/**
 * Created by 45925 on 2017/4/8.
 */

var express = require('express');
var router = express.Router();

var CourseModel = require('../models/courses');

// GET /courses?type=type 获取指定类型的课程
router.get('/', function(req, res, next) {
  var type = req.query.type;

  Promise.all([
      CourseModel.getCoursesByType('文学'),
      CourseModel.getCoursesByType('历史学'),
      CourseModel.getCoursesByType('法学'),
      CourseModel.getCoursesByType('经济学'),
      CourseModel.getCoursesByType('管理学'),
      CourseModel.getCoursesByType('教育学'),
      CourseModel.getCoursesByType('理学'),
      CourseModel.getCoursesByType('艺术学'),
      CourseModel.getCoursesByType('工学')
    ])
    .then(function (result) {
      var courses_1 = result[0];
      var courses_2 = result[1];
      var courses_3 = result[2];
      var courses_4 = result[3];
      var courses_5 = result[4];
      var courses_6 = result[5];
      var courses_7 = result[6];
      var courses_8 = result[7];
      var courses_9 = result[8];

      res.render('courses', {
        subtitle: 'scnu online',
        type: type,
        courses_1: courses_1,
        courses_2: courses_2,
        courses_3: courses_3,
        courses_4: courses_4,
        courses_5: courses_5,
        courses_6: courses_6,
        courses_7: courses_7,
        courses_8: courses_8,
        courses_9: courses_9
      });
    })
    .catch(next);
});

module.exports = router;
