var express = require("express");
var fs = require("fs");
var gm = require("gm");
var app  = express();
var md5 = require("./model/md5.js");
var db = require("./model/db.js");
var formidable = require("formidable");
var session = require("express-session");
app.use(session({
    secret: 'keyboard cat',
    resave: false,
    saveUninitialized: true
    //设置cookie是安全的 必须通过http连接才能访问到  所以不要写
    //cookie: { secure: true }
}));
app.listen(4000);
app.set("view engine","ejs");
app.use(express.static("./public"));
app.get("/",function(req,res){
   res.render("indexs",{
       "login":req.session.login =="1"?true:false,
       "username":req.session.login=="1"?req.session.username:""
   });
});
app.get("/regist",function(req,res){
    res.render("regist");
});
//处理请求
app.get("/doRegist",function(req,res){
    //1.获取参数
    var username = req.query.username;
    var pwd = req.query.pwd;
    //2.对密码加密
    pwd = md5(pwd);

    db.find("nusers",{"username":username},function(err,results){
        if(err){
            res.send("失败");
        }
        //1.检查用户名是否存在
        if(results.length!=0){
            res.send("-1");
            return;
        }else{

        db.insertOne("nusers",{"username":username,"pwd":pwd},function(err,result){
            if(err){
                res.send("-1");//数据库添加失败
                return;
            }
            res.send("1");
        })}
    });
    //3.入库

});
//处理登录请求
app.get("/login",function(req,res){
   res.render("login");
});
//处理正式登录
app.post("/doLogin",function(req,res){
    console.log("1111");
    //通过表单拿数据
    var form = new formidable.IncomingForm();
    form.parse(req,function(err,fields,files){
        var username = fields.username;
        var pwd = fields.pwd;
        pwd = md5(pwd);//转密文比较
        db.find("nusers",{"username":username,"pwd":pwd},function(err,result){
            console.log("========",result);
            //1.检查用户名是否存在
            if(result.length==0){
                res.send("-2");//用户名不存在
                return;
            }
            //2.用户名存在在判断密码是否正确
            var oldpwd = result[0].pwd;
            if(pwd==oldpwd){
                //记录登录状态名=username
                req.session.login="1";
                req.session.username =username;
                res.send("1");
            }else {
                res.send("-1");//密码不正确
            }
        });
    })
});

//上传图片跳转处理
app.get("/photo",function(req,res){
    res.render("photo");
});
//上传图片保存处理
 app.get("/doCut",function(req,res){
    //获取参数
    var w = req.query.width;
    var h = req.query.height;
    var l = req.query.left;
    var t = req.query.top;
    //使用gm剪切选中图片区域
    gm("./public/image/236.jpg").crop(w,h,l,t).resize(80,80,"!").write("./public/image/cut.jpg",function(err){
        if(err){
            console.log(err);
            res.send("剪切失败");
            return;
        }
        res.send("剪切成功");
    })
});







