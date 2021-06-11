var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
  console.log('inside index');
	res.render('index', { title: 'Return Request Demo' });
});

module.exports = router;
