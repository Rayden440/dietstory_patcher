const fs = require('fs');
const async = require('async');
const mysql = require('mysql');
const pool = require('./mysql-pool');

function getString(path, callback){
	fs.readFile(path, 'utf8', function(err, data){
		if(err){
			callback(err, null);
		}
		else{
			callback(null, data);
		}
	});
}

function query(path, params, callback){
	async.waterfall([

		// GET CONNECTION
		function(next){
			pool.getConnection(function(err, con){
				if(err){
					next(err);
				}
				else{
					next(null, con);
				}
			});
		},

		// READ SQL FILE
		function(con, next){
			getString(path, function(err, data){
				if(err){
					con.release();
					next(err);
				}
				else{
					next(null, con, data);
				}
			});
		},

		// EXECUTE QUERY
		function(con, data, next){
			if(params == null || params.length == 0){
				con.query(data, function(err, results, fields){
					con.release();

					if(err){
						next(err);
					}
					else{
						next(null, results, fields);
					}
				});
			}
			else{
				con.query(data, params, function(err, results, fields){
					con.release();

					if(err){
						next(err);
					}
					else{
						next(null, results, fields);
					}
				});
			}
		}
	], 
	// FINAL FUNCTION OF WATERFALL
	function(err, results, fields){
		if(err){
			callback(err, null, null);
		}
		else{
			callback(null, results, fields);
		}
	});
}

module.exports.getString = getString;
module.exports.query = query;