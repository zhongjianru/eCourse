/**
 * Created by zhongjr on 2017/3/27.
 */

$(document).ready(function () {
  $('button[id="remove"]').click(function () {
    $('.ui.small.modal').modal('show');
  });

  $('.modal #cancel').click(function () {
    $('.ui.small.modal').modal('hide');
  });

  $('.modal #confirm').click(function () {
    var url = $('#edit').attr('href');
    url = url.substr(0, url.length - 4) + 'remove';
    $.get(url, function (data, status) {
      alert(data);
      $('.ui.small.modal').modal('hide');
    });
  });
});
