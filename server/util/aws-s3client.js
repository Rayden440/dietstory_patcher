const express = require('express');
const bodyParser = require('body-parser');
const async = require('async');
const fs = require('fs');
const https = require('https');
const dotenv = require('dotenv');
const AWS = require('aws-sdk');
const app = express();
const pool = require('mysql-pool');
const routes = require('../routes/index');
const s3config = require('../config/aws-s3.json');

// LOADING ENVIRONMENT VARIABLES
dotenv.config(); 	// ALL ENVIRONMENT VARIABLESS ARE NOW IN process.env

// LOAD S3 CONFIGS
const s3 = new AWS.S3();
AWS.config.update({accessKeyId: s3config.accessKeyId, secretAccessKey: s3config.secretAccessKey});

//LOAD SQL QUERIES
var insertUpdatedFileQuery = fs.readFileSync("../sql/routes/latest-files/insert-updated-file.sql", 'utf8');

//Function to create a pre-signed url
function getSignedUrl(filename, callback)
{
	var params = {
		Bucket: s3config.bucket,
		Key: filename,
		Expires: s3config.expire_seconds
	};

	s3.getSignedUrl('putObject', params, function (err, url)
		{
			if(err)
			{
				callback(err, null);
			}
			else
			{
				callback(null, url);
			}
		});
}

//Function inserting new file
function insertUpdatedFile(filename, relativePath, shaKey, relativePath, callback)
{
	async.waterfall([
		//Get Connection from Pool
		pool.getConnection(callback),
		//Insert Entry into DB
		insertFileEntryToDB(filename, relativePath, shaKey, relativePath),
		], function(err, data, cb)
		{
			if(err)
			{
				console.log("Failed to insert new file reference into database. Retrying...");
				insertUpdatedFile(filename, relativePath, shaKey, relativePath, callback);
			}
			else
			{
				console.log(data);
			}
		});
}

//===================HELPER FUNCTIONS======================//
function insertFileEntryToDB(filename, relativePath, shaKey, relativePath, err, con, callback)
{
	if(err)
	{
		callback(err, null);
	}
	else
	{
		con.query(insertUpdatedFileQuery, [filename, relativePath, shaKey, relativePath], function(err, result)
		{
			con.release();
			if(err)
			{
				callback(err, null);
			}
			else
			{
				callback(null, result);
			}
		});
	}
}

module.exports.getSignedUrl = getSignedUrl;
module.exports.insertUpdatedFile = insertUpdatedFile;