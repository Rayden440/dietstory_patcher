const express = require('express');
const bodyParser = require('body-parser');
const fs = require('fs');
const https = require('https');
const dotenv = require('dotenv');
const app = express();
const routes = require('./routes/index');
const pool = require('./util/mysql-pool');

// LOADING ENVIRONMENT VARIABLES
dotenv.config(); 	// ALL ENVIRONMENT VARIABLESS ARE NOW IN process.env

// CREATING MYSQL CONNECTION POOL AND TESTING CONNECTION
pool.createPool();
pool.testConnection();

// USING body-parser TO PARSE POST DATA
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));

// LOADS /routes/index.js WHICH HOLDS ALL OF OUR ROUTES
app.use(routes);

// ERROR HANDLING
if(process.env.NODE_DEBUG_MODE === 'true'){ 	// WILL SEND ERROR TO USERS
	app.use(function(err, req, res, next){
		// DONT PRINT USER ERRORS
		if(err.status && err.status >= 500)
			console.log(err.stack);

		res.setHeader('Content-Type', 'text/plain');
		res.status(err.status || 500);
		res.send(err.stack);
	});
}
else{ 											// NO STACKTRACE LEAKED TO USERS
	app.use(function(err, req, res, next){
		// DONT PRINT USER ERRORS
		if(err.status && err.status >= 500)
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