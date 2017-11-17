const express = require('express');
const router = express.Router();
const sqlUtil = require('../util/sql-util');

const sqlFolder = __dirname +'/../sql/routes/latest-files/';

// GET INFORMATION ON LATEST FILE VERSION
router.get('/latest-files', function(req, res, appNext){
	sqlUtil.query(sqlFolder +'select-all-files-info.sql', null, function(err, results, fields){
		if(err){
			appNext(err);
		}
		else{
			res.setHeader('Content-Type', 'application/json');
			res.status(200).send(results);
		}
	});
});

module.exports = router;