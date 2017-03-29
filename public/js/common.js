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

  // 取消按钮，模态框消失
  $('.modal #cancel').click(function () {
    $('.ui.small.modal').modal('hide');
  });

  // 确认删除
  $('button[id="remove"]').click(function () {
    $('.ui.small.modal.remove').modal('show');
  });

  $('.modal.remove #confirm').click(function () {
    var url = $('#edit').attr('href');
    url = url.substr(0, url.length - 4) + 'remove';
    window.location.href = url;
  });

  // 修改头像
  $('a[id="modifyavt"]').click(function () {
    $('.ui.small.modal.modifyavt').modal('show');
  });
});
