var AV = require('leanengine');

var Record = AV.Object.extend('Record');

var recordTable="Record";
var authorCol="author"
var recordDateCol="recordDate"
var valueCol="value"

//Err Code Mapping
// 2001: Err in insert one record


//Return all the data of one specific user
function getAllMyRecords(req, res) {
  	console.log(req)
	
	//var user = req.AV.user;
	var user = AV.User.current();

	/*console.log("--------------------------")
  	console.log(user)
	console.log("--------------------------")*/
		
	var recordSet = new AV.Query(recordTable);
	recordSet.equalTo(authorCol,user);
	recordSet.descending(recordDateCol);
	
	var succ = {}, voList = [];

	recordSet.find().then(function(result){
		if(result.length){
				for(var i=0; i<result.length; i++){
					var record = {};
					record.author = result[i].get(authorCol) || "";
					record.value = result[i].get(valueCol) || "";
					console.log(record);
					voList.push(record);
				}
				succ.voList = voList;
				//console.log(succ)
				res.success(succ);
				//res.json(succ); // return JSON to web.
			}
	})
}

function report1Record(req, res) {
	var user = AV.User.current();
	//var user = req.AV.user;
	
	//var value = parseInt(req.body['value']) || 0;	
	var value =parseInt(req.params.value) || 0;
	//var value =1111;


	var record = new Record();
	if (user) {
		// 设置 ACL，可以使该 Record 只允许创建者修改，其他人只读
		// 更多的 ACL 控制详见： https://leancloud.cn/docs/js_guide.html#其他对象的安全
		var acl = new AV.ACL(user);
		acl.setPublicReadAccess(true);
		record.setACL(acl);
		
		record.set(authorCol, user);		
		record.set(valueCol, value);
		record.set(recordDateCol,new Date());
		
		record.save(null, {
			success: function(record) {
				 res.success({
                              success : true,
                              what : record
                              });
			},
			error: function(record, err) {
				console.log(err)

				res.success({
                           success : false,
                           code : 2001  
                });

			}
		});
	}
}

exports.getAllMyRecords=getAllMyRecords;
exports.report1Record=report1Record;
