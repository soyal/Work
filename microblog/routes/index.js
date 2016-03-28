var express = require('express');
var router = express.Router();
var crypto = require('crypto');
var User = require('../models/user');

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express'});
});
router.get('/register', function(req, res, next) {
  res.render('reg', { title: '注册'});
});
router.post("/register",function(req,res){
  if(req.body['password-repeat'] != req.body['password']) {
    req.flash('error','两次输入的口令不一致');
console.error("error：password="+req.body['password']+",password-repeat="+req.body['password-repeat']);
    return res.redirect("/register");
  }
  var md5 = crypto.createHash("md5");
  var password = md5.update(req.body['password']).digest('base64');
  var newUser = new User({
    name : req.body.username,
    password : password
  });

  newUser.get(newUser.name,function(err,user){
    //验证用户是否存在
    if(user) {
      err = "username has existed!";
    }
    if(err) {
      req.flash('error',err);
console.error("用户名",newUser.name,"存在！");
      return res.redirect("/register");
    }
    //用户名不存在,增加新用户
    newUser.save(function(err){
      if(err){
        req.flash('error',err);
        return res.redirect("/register");
      }
      req.session.user = newUser;
      req.flash('success','注册成功');
      res.redirect('/');
    });

  });
});
router.get('/hello', function(req, res, next) {
  res.send("this time is is " + new Date().toString());
});

module.exports = router;
