var express = require('express');
var router = express.Router();

/* GET users listing. */
router.get('/', function(req, res, next) {
  res.send('respond with a resource');
});
router.get('/:username', function(req, res, next) {
  console.log("this is get method");
  next();

});
router.get('/:username', function(req, res, next) {
  res.send('user22:' + req.params.username);
});

module.exports = router;
