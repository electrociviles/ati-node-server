var express = require('express');
var router = express.Router();
var schemas = require('../models/schemas');
/* GET home page. */
router.get('/', function (req, res, next) {
  res.render('index', { title: 'Express' });
});
router.post('/', function (req, res, next) {
  console.log('_______________ Body _____________________')
  console.log(req.body)
  if (req.body.lat && req.body.lng && req.body.person) {
    console.log("Updated")
    schemas.Person.updateOne({ _id: req.body.person }, { latitude: req.body.lat, longitude: req.body.lng }, { new: true }).exec()
    res.json({
      status: true,
      message: 'Post'
    })
  } else {
    console.log("No updated")
    res.json({
      status: false,
      message: 'Post'
    })
  }

});

module.exports = router;
