const express = require('express');
const async = require('async');
const dotenv = require('dotenv');
const sanitizer = require('sanitizer');
const sqlUtil = require('../util/sql-util');
const validator = require('../util/validator');
const tokenGenerator = require('../util/token-generator');
const router = express.Router();

dotenv.config();
const sqlFolder = __dirname + '/../sql/routes/login/';

// ROUTE FOR DEVELOPERS LOGIN
router.post('/login/devs', function(req, res, appNext){
	async.waterfall([
		// SANITIZING FORM DATA
		function(next){
			req.body.username = sanitizer.sanitize(req.body.username);
			req.body.password = sanitizer.sanitize(req.body.password);
			next(null);
		},

		// VALIDATING FORM DATA
		function(next){
			if(validator.isEmpty(req.body.username) || validator.isEmpty(req.body.password)){
				var err = new Error('Form is incomplete');
				Error.captureStackTrace(err);
				err.status = 400;
				next(err);
			}
			else{
				next(null);
			}
		},

		// CHECK IF LOGIN INFO IS VALID AND IF GM LEVEL IS SUFFICIENTLY HIGH
		function(next){
			const parameters = [
				req.body.username,
				req.body.password,
				process.env.NODE_MIN_DEV_TOOL_LEVEL
			];

			sqlUtil.query(sqlFolder +'check-dev-login.sql', parameters, function(err, results, fields){
				if(err){
					next(err);
				}
				else if(results[0].valid == 1){
					next(null, results[0].account_id);
				}
				else{
					let err = new Error('Incorrect username or password');
					Error.captureStackTrace(err);
					err.status = 401;
					next(err);
				}
			});
		},

		// GENERATING JSON WEB TOKEN FOR USER
		function(accountId, next){
			const payload = {
				id: accountId,
				username: req.body.username
			};
			const options = {
				expiresIn: parseInt(process.env.NODE_JWT_EXPIRY)/1000,
				issuer: process.env.NODE_DOMAIN
			};
			const expiry = Date.now() + parseInt(process.env.NODE_JWT_EXPIRY);

			tokenGenerator.generate(payload, options, function(err, token){
				if(err){
					next(err);
				}
				else{
					next(null, token, expiry);
				}
			});
		}
	], 
	// FINAL FUNCTION OF WATERFALL
	function(err, token, expiry){
		if(err){
			appNext(err);
		}
		else{
			let response = {
				status: 200,
				message: 'login success',
				token: token,
				expiry: expiry
			};

			res.setHeader('Content-Type', 'application/json');
			res.status(200).send(response);
		}
	});
});



// ROUTE FOR REFRESHING A TOKEN
// router.get('/login/refresh-token', function(req, res, appNext){
// 	async.waterfall([
		
// 	], 
// 	// FINAL FUNCTION OF WATERFALL
// 	function(err){});
// });




module.exports = router;