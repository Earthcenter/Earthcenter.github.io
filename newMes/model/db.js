/*DAO层的封装，封装了跟数据库相关的常用操作*/
var MongoClient = require("mongodb").MongoClient;
var settings = require("../settings.js");//{dburl：}
//1.建立链接
function _connectDB(callback){
    //var url = "mongodb://localhost:27017/web1703";
    var url= settings.dburl;
    MongoClient.connect(url,function(err,db){
        if(err){
            //console.log("连接出错");
            callback(err,null);
        }
        callback(null,db);
        console.log("成功");
    });
}
/*_connectDB(function(db){
    console.log(db);
});*/

//2.定义插入方法
exports.insertOne = function(collectionName,json,callback){
    //2.1建立链接
    _connectDB(function(err,db){
        db.collection(collectionName).insertOne(json,function(err,result){
            callback(err,result)
        });
        db.close();
    })
};
//3.修改方法
//update({"name":"zhangsan"},{$set:{"name":"lisi"}})
exports.updateMany = function(collectionName,json1,json2,callback){
    _connectDB(function(err,db){
        db.collection(collectionName).updateMany(json1,json2,{multiple:true},function(err,result){
            callback(err,result);
            db.close();
        })
    })
};
//4.删除
//remove({"name":"insert})
exports.deleteMany = function(collectionName,json,callback){
    _connectDB(function(err,db){
        db.collection(collectionName).deleteMany(json,function(err,result){
           callback(err,result);
        })
        db.close();
    })
};
//5.查询
//db.student.fin({"age":30});

/*
假设有17条数据 每页显示pageSize条 现在只希望 查询第三页的数据
db.student.fin({"age":30}).skip(pageSize*(page-1)).limit(pageSize)sort();*/
exports.find = function(collectionName,json,C,D){
/*    先判断用户调用时传入了几个参数
    如果是3个参数 分别代表：（集合名称 查询参数 回调函数）
    */
    if(arguments.length==3){
        var callback = C;
        var skipnum = 0;
        var limitnum = 0;
        var sort = {};
    }else if(arguments.length==4){
        /*如果是4个参数，分别代表：（集合名称，查询参数，分页配置=>{每页显示几条，当前第几页}）*/
        var callback = D;
        var args = C;//{"pageSize":3,"page":3,"sort":{"age":-1}}
        //计算出需要跳过多少条数据
        var skipnum = args.pageSize*(args.page-1)||0;
        //查询几条数据
        var limitnum = args.pageSize||0;
        //排序方式
        var sort = args.sort||{};
    }
    _connectDB(function(err,db){
        var all = db.collection(collectionName).find(json).skip(skipnum).limit(limitnum).sort(sort);
        //将all对象转成数组
        var allResults = [];
        all.toArray(function(err,docs){
            if(err){
                callback(err,null);
                db.close();
                return;
            }
            allResults=docs;
            callback(null,allResults);
            db.close();
        })
    })
};

//定义查询总记录数方法    拿出所记录数字
exports.findAllCount = function(collectionName,callback){
    _connectDB(function(err,db){
        db.collection(collectionName).count({}).then(function(count){
            console.log("count",count);
            callback(count);
            db.close();
        })
    })
};





