const mysql = require('mysql');
const dotenv = require('dotenv');

dotenv.config();

var pool = null;

function createPool(){
	pool = mysql.createPool({
		connectionLimit: parseInt(process.env.DB_CONNECTION_LIMIT),
		host: process.env.DB_HOSTNAME,
		port: parseInt(process.env.DB_PORT),
		user: process.env.DB_USERNAME,
		password: process.env.DB_PASSWORD,
		database: process.env.DB_NAME
	});
}

function getConnection(callback){
	if(pool == null){
		var err = new Error('Connection pool has yet to be created.');
		Error.captureStackTrace(err);

		callback(err, null)
	}
	else{
		pool.getConnection(function(err, con){
			if(err){
				callback(err, null);
			}
			else{
				callback(null, con);
			}
		});
	}
}

function testConnection(){
	getConnection(function(err, con){
		if(err){
			console.log(err.stack);
		}
		else{
			con.release();
			console.log('Database Test: PASSED');
		}
	});
}

module.exports.createPool = createPool;
module.exports.getConnection = getConnection;
module.exports.testConnection = testConnection;