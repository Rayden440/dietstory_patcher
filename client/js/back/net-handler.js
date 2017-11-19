const electron = require('electron');
const request = require('request');
const path = require('path');

function getFileInfo(mainWindow){
	let options = {
		url: process.env.DS_WEB_SERVER_HOME +'/latest-files',
		method: 'GET'
	}

	request(options, function(err, res, body){
		if(res == null){
			console.log('NO RESPONSE FROM SERVER');
		}
		else if(res.statusCode == 200){
			body = JSON.parse(body);

			mainWindow.webContents.send('file-info:set-info', body);
		}
		else{
			console.log('SERVER ERROR');
		}
	});
}


function upload(mainWindow, files){

	// request documentation: https://github.com/request/request

	/*
		files = {
			changed: [File, File, ...],
			new: [File, File, ...]
		}

		vvvv This object is found in the arrays above ^
		File = {
			last_changed: 1507975186627, 													// in milliseconds
       		link: '(not uploaded)', 														// no link because not uploaded yet
       		name: 'Effect.wz', 																// name of file
       		path: './Effect.wz', 															// relative path, to get full path use: path.join(process.env.ELECTRON_STARTING_DIRECTORY, path);
       		sha256: '3504500e6891895f747cbac9bd707f8faf0815c9d0df79ecd468c6b15b33d660', 	// SHA-256
       		size: 63334965 																	// bytes
		}
	*/
}




module.exports.getFileInfo = getFileInfo;
module.exports.upload = upload;