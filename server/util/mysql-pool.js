const mysql = require('mysql');


var pool = null;

function createPool(env){
	pool = mysql.createPool({
		connectionLimit: parseInt(env.DB_CONNECTION_LIMIT),
		host: env.DB_HOSTNAME,
		port: parseInt(env.DB_PORT),
		user: env.DB_USERNAME,
		password: env.DB_PASSWORD,
		database: env.DB_NAME
	});
}

function getConnection(callback){
	if(pool == null){
		var err = new Error('Connection pool has not been created yet.');
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