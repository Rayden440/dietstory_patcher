const express = require('express');
const dotenv = require('dotenv');
const s3client = require('../util/aws-s3client');
const router = express.Router();

router.post('/devs/get-signed-url', function(req, res, next){
	s3client.getSignedUrl(req.body.filename, function(err, presignedUrl, callback){
		res.send(presignedUrl);
	});
});

router.post('/devs/insert-updated-file', function(req,res,next){
	s3client.insertUpdatedFile(req.body.filename, req.body.relativePath, req.body.shaKey, req.body.direct_download, function(err, data, callback){
		console.log(data);
	});
});

module.exports = router;