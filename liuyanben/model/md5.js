//MD5二次加密工具
var crypto = require("crypto");
function _md5(pwd){
    var md5 = crypto.createHash("md5");
    var hash = md5.update(pwd).digest("base64");
    return hash;
}
module.exports=function(pwd){
    return _md5(_md5(pwd).substr(4,10)+_md5("xmz"));
};