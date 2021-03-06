var express = require('express');
var router = express.Router();

var AV = require('leanengine');

var Record = AV.Object.extend('Record');

router.post('/', function(req, res, next) {
  var value = req.body.value;
  var record = new Record();
  if (req.AV.user) {
    // 设置 ACL，可以使该 Record 只允许创建者修改，其他人只读
    // 更多的 ACL 控制详见： https://leancloud.cn/docs/js_guide.html#其他对象的安全
    var acl = new AV.ACL(req.AV.user);
    acl.setPublicReadAccess(true);
    record.setACL(acl);
  }
  record.set('value', value);
  record.set('status', 0);
  if (req.AV.user) {
    record.set('author', req.AV.user);
  }
  record.set("recordDate",new Date());
  record.save(null, {
    success: function(record) {
      res.redirect('/records')
    },
    error: function(Record, err) {
      next(err);
    }
  });
});

router.get('/', function(req, res, next) {
  var status = 0;
  var errMsg = null;
  if (req.query) {
    status = req.query.status || 0;
    errMsg = req.query.errMsg;
  }
  var query = new AV.Query(Record);
  query.equalTo('status', parseInt(status));
  query.include('author');
  query.descending('updatedAt');
  query.limit(50);
  query.find({
    success: function(results) {
      res.render('records', {
        title: 'Record 列表',
        user: AV.User.current(),
        records: results, 
        status: status,
        errMsg: errMsg
      });
    },
    error: function(err) {
      next(err);
    }
  })
});




module.exports = router;
