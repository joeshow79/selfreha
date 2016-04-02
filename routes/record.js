var express = require('express');
var router = express.Router();

var AV = require('leanengine');

var data = AV.Object.extend('Record');

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
  record.save(null, {
    success: function(record) {
	res.success({
		success : true,
		value : {}
	});
    },
    error: function(Record, err) {
      next(err);
    }
  });
});

router.get('/', function(req, res, next) {
  var userid = req.AV.user;
  var errMsg = null;
  if (req.query) {
    userid = req.query.userid || 0;
    errMsg = req.query.errMsg;
  }
  var query = new AV.Query('Record');
  query.equalTo('author', userid);
  query.include('status');
  query.descending('updatedAt');
  query.limit(50);
  query.find({
    success: function(results) {
	    res.json(results);
    },

    error: function(err) {
      next(err);
    }
  })
});

// return live list in JSON format
function getLiveList(req, res) {
	var start = parseInt(req.body['start']);
	var limit = parseInt(req.body['limit']);

	var cql = "select include caster, * from Live where liveStatus='Stopped' limit ? , ? order by updatedAt desc";

	if (start == "undefined" || limit == "undefined")
		cql = "select * from Live where liveStatus='Stopped'";
	var proSelect = AV.Query.doCloudQuery(cql, [start, limit ]);

	var countCql = "select count(*) from Live where liveStatus='Stopped'";
	AV.Query.doCloudQuery(countCql).then(function(result) {
		var num = result.count;
		var succ = {}, voList = [];
		succ.totalCount = num;
		proSelect.then(function(result) {
			var results = result.results;
			if(results.length){
				for(var i=0; i<results.length; i++){
					var live = {};
					var caster = results[i].get('caster')
					live.nickName = caster ? (caster.get('nickname')  ||  "") : "";
					live.likeCount = results[i].get('likeCount') || 0;
					live.rtmpUrl = results[i].get('rtmpUrl') || "";
					live.hlsUrl = results[i].get('hlsUrl') || "";
					live.watchCount = results[i].get('watchCount') || 0;
					
					voList.push(live);
				}
				succ.voList = voList;
				
				res.json(succ); // return JSON to web.
			}
		});
	});

}

module.exports = router;
