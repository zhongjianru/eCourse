/**
 * Created by zhongjr on 2017/3/27.
 */

$(document).ready(function () {
  // 点击按钮弹出下拉框
  $('.ui.dropdown').dropdown();
  // 鼠标悬浮在头像上，弹出气泡提示框
  $('.course-content .avatar').popup({
    inline: true,
    position: 'bottom right',
    lastResort: 'bottom right',
  });

  // 点击取消按钮，模态框消失
  $('.modal #cancel').click(function () {
    $('.ui.small.modal').modal('hide');
  });

  // 确认删除课程
  $('button[id="remove"]').click(function () {
    $('.ui.small.modal.remove').modal('show');
  });

  // 修改头像
  $('a[id="modifyavt"]').click(function () {
    $('.ui.small.modal.modifyavt').modal('show');
  });

  // 回复留言
  $('a[id="reply"]').click(function () {
    $('.ui.small.modal.reply').modal('show');
  });

  // 教师上传课件
  $('a[id="uploadczw"]').click(function () {
    $('.ui.small.modal.uploadczw').modal('show');
  });

  // 学生提交作业
  $('a[id="uploadhwk"]').click(function () {
    $('.ui.small.modal.uploadhwk').modal('show');
  });

  // 选项卡
  $('.dynamic .menu .item')
    .tab({
      cache: false,
      // faking API request
      apiSettings: {
        loadingDuration : 300,
        mockResponse: function(settings) {
          var response = {
            first  : 'AJAX Tab One',
            second : 'AJAX Tab Two',
            third  : 'AJAX Tab Three'
          };
          return response[settings.urlData.tab];
        }
      },
      context : 'parent',
      auto    : true,
      path    : '/'
    });

  // 遮罩
  $('.event.example .image')
    .dimmer({
      on: 'hover'
    })
  ;
});
