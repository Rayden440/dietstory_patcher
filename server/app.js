const express = require('express');
const fs = require('fs');
const https = require('https');
const dotenv = require('dotenv');
const app = express();
const routes = require('./routes/index');
const pool = require('./util/mysql-pool');

// LOADING ENVIRONMENT VARIABLES
dotenv.config(); 	// ALL ENVIRONMENT VARIABLESS ARE NOW IN process.env

// CREATING MYSQL CONNECTION POOL
pool.createPool(process.env);

// TESTING CONNECTION WITH DATABASE
pool.testConnection();

// LOADS /routes/index.js WHICH HOLDS ALL OF OUR ROUTES
app.use(routes);

// ERROR HANDLING
if(process.env.NODE_DEBUG_MODE === 'true'){ 	// WILL SEND ERROR TO USERS
	app.use(function(err, req, res, next){
		console.log(err.stack);
		res.setHeader('Content-Type', 'text/plain');
		res.status(err.status || 500);
		res.send(err.stack);
	});
}
else{ 											// NO STACKTRACE LEAKED TO USERS
	app.use(function(err, req, res, next){
		console.log(err.stack);
		res.setHeader('Content-Type', 'text/plain');
		res.status(err.status || 500);
		res.send('There was an error with the server!');
	});
}

// STARTS THE SERVER
if(process.env.NODE_USE_SSL === 'true'){ 	// HTTPS
	var credentials = {
		key: fs.readFileSync(__dirname + '/ssl/key.pem'),
		cert: fs.readFileSync(__dirname + '/ssl/cert.pem')
	};

	https.createServer(credentials, app).listen(parseInt(process.env.NODE_PORT));
	console.log('Node server listening on port ' +process.env.NODE_PORT +'...');
}
else{ 										// HTTP
	app.listen(parseInt(process.env.NODE_PORT), function(){
		console.log('Node server listening on port ' +process.env.NODE_PORT +'...');
	});
}