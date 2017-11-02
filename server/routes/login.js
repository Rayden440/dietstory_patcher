const express = require('express');
const router = express.Router();

// ROUTE FOR DEVELOPERS LOGIN
router.post('/devs', function(req, res, appNext){
	// TODO: CHECK LOGIN INFORMATION WITH THE DATABASE
	console.log(req.body);
	res.setHeader('Content-Type', 'text/plain');
	res.status(200).send("OK");
});

module.exports = router;