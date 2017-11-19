const electron = require('electron');
const crypto = require('crypto');
const async = require('async');
const path = require('path');
const fs = require('fs');

function generateHash(mainWindow, files){
	async.map(files, function(singleFile, callback){
		fs.createReadStream(singleFile.path).pipe(crypto.createHash('sha256').setEncoding('hex')).on('finish', function(){
			singleFile.path = './' +path.relative(process.env.ELECTRON_STARTING_DIRECTORY, singleFile.path).replace(/\\/g, '/');
			singleFile.sha256 = this.read();
			singleFile.link = '(not uploaded)';
			
			callback(null, singleFile);
		});
	}, 
	function(err, results){
		mainWindow.webContents.send('dev-add-untracked-files:hash-complete', results);
	});
}


function difference(mainWindow, files){
	async.filter(files, function(singleFile, callback){
		fs.createReadStream(path.join(process.env.ELECTRON_STARTING_DIRECTORY, singleFile.path)).pipe(crypto.createHash('sha256').setEncoding('hex')).on('finish', function(){
			const oldHash = singleFile.sha256;
			const newHash = this.read();

			singleFile.sha256 = newHash;
			singleFile.link = '(not uploaded)';

			callback(null, (oldHash != newHash));
		});	
	}, 
	function(err, results){
		async.each(results, function(singleFile, callback){
			fs.stat(path.join(process.env.ELECTRON_STARTING_DIRECTORY, singleFile.path), function(err, stat){
				singleFile.last_changed = new Date(stat.mtime).getTime();
				singleFile.size = stat.size;
				callback(null);
			});
		}, 
		function(err){
			mainWindow.webContents.send('dev-scan-files:changed-files', results);
		});
	});
}


module.exports.generateHash = generateHash;
module.exports.difference = difference;