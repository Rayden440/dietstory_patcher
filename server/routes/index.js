const express = require('express');
const router = express.Router();

// ROUTE FOR HOMEPAGE
router.get('/', function(req, res, appNext){
	res.setHeader('Content-Type', 'text/plain');
	res.status(200).send('DietStory landing page LUL');
});

// ROUTE FOR LASTEST FILE VERSIONS
router.use('/latest-files', require('./latest-files'));

// ROUTE FOR LOGIN
router.use('/login', require('./login'));







// 404 NOT FOUND
router.get('*', function(req, res, appNext){
	res.status(404).send('What you\'re looking for does not exist.');
});

module.exports = router;