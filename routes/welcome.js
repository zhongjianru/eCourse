/**
 * Created by 45925 on 2017/3/26.
 */

var express = require('express');
var router = express.Router();

var CourseModel = require('../models/courses');

// GET /welcome 首页
router.get('/', function(req, res, next) {
  res.render('welcome', {
    subtitle: 'scnu online'
  });
});

module.exports = router;
