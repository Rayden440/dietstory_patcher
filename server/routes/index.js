const express = require('express');
const router = express.Router();

// ROUTE FOR HOMEPAGE
router.get('/', function(req, res, appNext){
	res.setHeader('Content-Type', 'text/plain');
	res.status(200).send('DietStory landing page LUL');
});

// ROUTE FOR LASTEST FILE VERSIONS
router.use('/', require('./latest-files'));

// ROUTE FOR LOGIN
router.use('/', require('./login'));

//MIDDLEWARE CHECK FOR DEV LOGINS
router.use(require('./jwt-verification'));

//ROUTES FOR UPLOAD FILE 
router.use(require('./s3-upload.js'));


// 404 NOT FOUND
router.get('*', function(req, res, appNext){
	res.status(404).send('What you\'re looking for does not exist.');
});

router.post('*', function(req, res, appNext){
	res.status(404).send('Not found.');
});

module.exports = router;