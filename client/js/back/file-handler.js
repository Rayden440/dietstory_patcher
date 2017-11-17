const electron = require('electron');
const crypto = require('crypto');
const async = require('async');
const fs = require('fs');

function generateHash(mainWindow, files){
	async.map(files, function(singleFile, callback){
		fs.createReadStream(singleFile.path).pipe(crypto.createHash('sha256').setEncoding('hex')).on('finish', function(){

			let startingDirRegex = process.env.ELECTRON_STARTING_DIRECTORY.replace(/\\/g, '\\\\') +'\\\\';
			singleFile.path = singleFile.path.replace(new RegExp(startingDirRegex, 'g'), './');

			singleFile.sha256 = this.read();
			singleFile.link = '(not uploaded)';
			callback(null, singleFile);
		});
	}, 
	function(err, results){
		mainWindow.webContents.send('dev-add-untracked-files:hash-complete', results);
	});
}


module.exports.generateHash = generateHash;