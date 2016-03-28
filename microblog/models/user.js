/**
 * Created by Soyal on 2015/11/1.
 */
var mongodb = require("./db");

function User(user) {
    this.name = user.name;
    this.password = user.password;
}
module.exports = User;

User.prototype.save = function(callback) {
    var user = {
        name : this.name,
        password : this.password
    };
    mongodb.open(function(err,db) {
        if(err) {
            callback(err);
        }
        db.collection('users',function(err,collection) {
            if(err) {
                mongodb.close();
                return callback(err);
            }
            //为name 添加索引
            collection.ensureIndex('name',{unique:true});
console.log("---------",user.name);
            collection.insert(user,{safe:true},function(err,user) {
                mongodb.close();
                callback(err,user);
            });
        });
    });
};

User.prototype.get = function(username,callback) {
    mongodb.open(function(err,db){
        if(err){
            mongodb.close();
            return callback(err);
        }
        db.collection('users',function(err,collection){
            if(err){
                mongodb.close();
                return callback(err);
            }
            collection.findOne({name:username},function(err,doc){
                mongodb.close();
                if(doc) {
                    var user = new User(doc);
                    callback(err,user);
                } else{
                    callback(err,null);
                }
            });
        });
    });
};