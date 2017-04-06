/**
 * Created by zhongjr on 2017/4/6.
 */

var express = require('express');
var router = express.Router();

router.post('/', function (req, res, next) {
  var type = req.fields.type;
  var words = req.fields.query;
  
  if(type.toString() === 'course') {
    
  }
});

module.exports = router;
