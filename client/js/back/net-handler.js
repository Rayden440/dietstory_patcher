const electron = require('electron');
const request = require('request');

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

module.exports.getFileInfo = getFileInfo;