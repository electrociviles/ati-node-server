var express = require('express');
var router = express.Router();
var schemas = require('../models/schemas');
/* GET home page. */
router.get('/', function (req, res, next) {
  res.render('index', { title: 'Express' });
});
router.post('/', function (req, res, next) {
  console.log('_______________ Yes _____________________')
  console.log(req.body)
  console.log('_______________ Yes _____________________')
  if (req.body.lat && req.body.lng && req.body.user) {
    schemas.Person.findOneAndUpdate({ _id: req.body.user }, { latitude: req.body.lat, longitude: req.body.lng }, { new: true }).exec()
  }
  res.json({
    status: true,
    message: 'Post'
  })
});

module.exports = router;
