var marked = require('marked');
var Course = require('../lib/mongo').Course;
var CommentModel = require('./comments');
var AttenderModel = require('./attenders');
var LessonModel = require('../models/lessons');
var CozwareModel = require('../models/cozwares');
var LessoncmtModel = require('../models/lessoncmts');
var LessonhwkModel = require('../models/lessonhwks');

// 给 course 添加留言数 commentsCount
Course.plugin('addCommentsCount', {
  afterFind: function (courses) {
    return Promise.all(courses.map(function (course) {
      return CommentModel.getCommentsCount(course._id).then(function (commentsCount) {
        course.commentsCount = commentsCount;
        return course;
      });
    }));
  },
  afterFindOne: function (course) {
    if (course) {
      return CommentModel.getCommentsCount(course._id).then(function (count) {
        course.commentsCount = count;
        return course;
      });
    }
    return course;
  }
});

// 给 course 添加课程参与人数 attendersCount
Course.plugin('addAttendersCount', {
  afterFind: function(courses) {
    return Promise.all(courses.map(function (course) {
      return AttenderModel.getAttendersCount(course._id).then(function (attendersCount) {
        course.attendersCount = attendersCount;
        return course;
      });
    }));
  },
  afterFindOne: function (course) {
    if(course) {
      return AttenderModel.getAttendersCount(course._id).then(function (count) {
        course.attendersCount = count;
        return course;
      });
    }
    return course;
  }
});

// 将 course 的 content 从 markdown 转换成 html
Course.plugin('contentToHtml', {
  afterFind: function (courses) {
    return courses.map(function (course) {
      course.content = marked(course.content);
      return course;
    });
  },
  afterFindOne: function (course) {
    if (course) {
      course.content = marked(course.content);
    }
    return course;
  }
});

module.exports = {
  // 创建课程
  create: function create(course) {
    return Course.create(course).exec();
  },

  // 通过课程 id 获取课程
  getCourseById: function getCourseById(courseId) {
    return Course
      .findOne({ _id: courseId })
      .populate({ path: 'author', model: 'User' })
      .addCreatedAt()
      .addAttendersCount()
      .addCommentsCount()
      .contentToHtml()
      .exec();
  },

  // 按创建时间降序获取所有已审核的课程
  getCourses: function getCourses() {
    return Course
      .find({ status: '1' })
      .populate({ path: 'author', model: 'User' })
      .sort({ _id: -1 })
      .addCreatedAt()
      .addAttendersCount()
      .addCommentsCount()
      .contentToHtml()
      .exec();
  },

  // 通过用户 id 获取该用户发表的已审核的课程
  getCoursesByUserId: function getCoursesByUserId(userId) {
    return Course
      .find({ author: userId, status: '1' })
      .populate({ path: 'author', model: 'User' })
      .sort({ _id: -1 })
      .addCreatedAt()
      .addAttendersCount()
      .addCommentsCount()
      .contentToHtml()
      .exec();
  },

  // 通过用户 id 获取该用户发表的未审核的课程
  getRejectedCoursesByUserId: function getRejectedCoursesByUserId(userId) {
    return Course
      .find({ author: userId, status: '0' })
      .populate({ path: 'author', model: 'User' })
      .sort({ _id: -1 })
      .addCreatedAt()
      .addAttendersCount()
      .addCommentsCount()
      .contentToHtml()
      .exec();
  },

  // 通过课程 id 给 pv 加 1
  incPv: function incPv(courseId) {
    return Course
      .update({ _id: courseId }, { $inc: { pv: 1 } })
      .exec();
  },
  
  // 通过课程 id 给 cmt 加 1
  incCmt: function incCmt(courseId) {
    return Course
      .update({ _id: courseId }, { $inc: { cmt: 1 } })
      .exec();
  },
  
  // 通过课程 id 给 atd 加 1
  incAtd: function incAtd(courseId) {
    return Course
      .update({ _id: courseId }, { $inc: { atd: 1 } })
      .exec();
  },

  // 通过课程 id 给 cmt 减 1
  decCmt: function decCmt(courseId) {
    return Course
      .update({ _id: courseId }, { $inc: { cmt: -1 } })
      .exec();
  },

  // 通过课程 id 给 atd 减 1
  decAtd: function decAtd(courseId) {
    return Course
      .update({ _id: courseId }, { $inc: { atd: -1 } })
      .exec();
  },

  // 通过课程 id 获取原来课程内容（编辑课程）
  getRawCourseById: function getRawCourseById(courseId) {
    return Course
      .findOne({ _id: courseId })
      .populate({ path: 'author', model: 'User' })
      .exec();
  },

  // 通过用户 id 和课程 id 更新课程
  updateCourseById: function updateCourseById(courseId, author, data) {
    return Course.update({ author: author, _id: courseId }, { $set: data }).exec();
  },

  // 通过用户 id 和课程 id 删除课程
  delCourseById: function delCourseById(courseId, author) {
    return Course
      .update({ author: author, _id: courseId }, { $set: { status: '2' } })
      .exec()
      .then(function (res) {
        // 课程删除后，删除该课程下的所有留言、参与者、课程内容、课件、学生作业、学生留言
        if (res.result.ok && res.result.n > 0) {
            CommentModel.delCommentsByCourseId(courseId);
            AttenderModel.delAttendersByCourseId(courseId);
            LessonModel.delLessonsByCourseId(courseId);
            CozwareModel.delCozwaresByCourseId(courseId);
            LessoncmtModel.delLessoncmtsByCourseId(courseId);
            LessonhwkModel.delLessonhwksByCourseId(courseId);
        }
      });
  },

  // 按创建时间降序获取所有未审核的课程
  getRejectedCourses: function getRejectedCourses() {
    return Course
      .find({ status: '0' })
      .populate({ path: 'author', model: 'User' })
      .sort({ _id: -1 })
      .addCreatedAt()
      .addAttendersCount()
      .addCommentsCount()
      .contentToHtml()
      .exec();
  },

  // 将未审核课程置为已通过审核
  updateStatusById: function updateStatusById(courseId) {
    return Course.update({ _id: courseId }, { $set: { status: '1' } }).exec();
  }
};
