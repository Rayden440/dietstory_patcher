const electron = require('electron');
const request = require('request');

function devLogin(mainWindow, session, credentials){
	let options = {
		url: process.env.DS_WEB_SERVER_HOME +'/login/devs',
		method: 'POST',
		form: credentials
	}

	// POSTING TO SERVER
	request(options, function(err, res, body){
		if(res == null){ 						// SERVER NO RESPONSE
			mainWindow.webContents.send('dev-login:failure', {reason: 'No Server Response', status: null});
		}
		else if(res.statusCode == 200){ 		// LOGIN SUCCESSFUL
			body = JSON.parse(body);

			const cookie = {
				url: process.env.DS_WEB_SERVER_HOME,
				name: 'dev_token',
				value: body.token
				//expirationDate: body.expiry/1000
			};

			session.defaultSession.cookies.set(cookie, function(err){
				if(err){ 	// FAILED TO WRITE COOKIE
					mainWindow.webContents.send('dev-login:failure', {reason: 'Token Storage Error', status: null});
				}
				else{ 		// ALL GOOD
					mainWindow.webContents.send('dev-login:success');
				}
			});
		}
		else if(res.statusCode % 400 < 100){ 	// LOGIN FAILED 4XX ERROR CODE
			mainWindow.webContents.send('dev-login:failure', {reason: 'Invalid Username or Password', status: res.statusCode});
		}
		else{
			mainWindow.webContents.send('dev-login:failure', {reason: 'Server Error', status: res.statusCode});
		}
	});
}




function checkDevToken(mainWindow, session){
	session.defaultSession.cookies.get({url: process.env.DS_WEB_SERVER_HOME, name: 'dev_token'}, function(err, cookies){
		if(err || cookies == null || cookies.length == 0){
			mainWindow.webContents.send('dev-login:no-token');
		}
		else{
			mainWindow.webContents.send('dev-login:have-token');
		}
	});
}

module.exports.devLogin = devLogin;
module.exports.checkDevToken = checkDevToken;