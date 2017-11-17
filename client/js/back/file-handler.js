const electron = require('electron');
const crypto = require('crypto');
const async = require('async');
const path = require('path');
const fs = require('fs');

function generateHash(mainWindow, files){
	async.map(files, function(singleFile, callback){
		fs.createReadStream(singleFile.path).pipe(crypto.createHash('sha256').setEncoding('hex')).on('finish', function(){
			singleFile.path = './' +path.relative(process.env.ELECTRON_STARTING_DIRECTORY, singleFile.path);
			singleFile.sha256 = this.read();
			singleFile.link = '(not uploaded)';
			
			callback(null, singleFile);
		});
	}, 
	function(err, results){
		console.log(results);
		mainWindow.webContents.send('dev-add-untracked-files:hash-complete', results);
	});
}


module.exports.generateHash = generateHash;