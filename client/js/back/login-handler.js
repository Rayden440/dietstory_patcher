const electron = require('electron');
const jwt = require('jsonwebtoken');
const request = require('request');

function devLogin(mainWindow, session, credentials){
	let options = {
		url: process.env.DS_WEB_SERVER_HOME +'/login/devs',
		method: 'POST',
		form: credentials
	};

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
				value: body.token,
				expirationDate: body.expiry/1000
			};

			session.defaultSession.cookies.set(cookie, function(err){
				if(err){ 	// FAILED TO WRITE COOKIE
					mainWindow.webContents.send('dev-login:failure', {reason: 'Token Storage Error', status: null});
				}
				else{ 		// ALL GOOD
					mainWindow.webContents.send('dev-login:success', {tokenString: body.token, decoded: jwt.decode(body.token)});
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
			const token = jwt.decode(cookies[0].value); 	// EXPIRY TIME OF TOKEN IS IN SECONDS
			const now = new Date().getTime()/1000;			// TIME RIGHT NOW IN SECONDS
			const _24hrs = 24 * 60 * 60;
			
			if((token.exp - now) <= _24hrs){ 	// TOKEN EXIRES SOON => REQUEST SERVER FOR A NEW ONE
				let options = {
					url: process.env.DS_WEB_SERVER_HOME +'/login/refresh-token',
					method: 'GET',
					headers: {
						'DEV-JWT': token
					}
				};

				request(options, function(err, res, body){
					if(res != null && res.statusCode == 200){ 				// GOT NEW TOKEN => SET COOKIE AND USE NEW TOKEN
						body = JSON.parse(body);

						const newCookie = {
							url: process.env.DS_WEB_SERVER_HOME,
							name: 'dev_token',
							value: body.token,
							expirationDate: body.expiry/1000
						};

						session.defaultSession.cookies.set(newCookie, function(err){
							if(err){ 						// ERR => USE OLD TOKEN
								mainWindow.webContents.send('dev-login:have-token', {tokenString: cookies[0].value, decoded: token});
							}
							else{ 							// USE NEW TOKEN
								mainWindow.webContents.send('dev-login:have-token', {tokenString: body.token, decoded: jwt.decode(body.token)});
							}
						});
					}
					else{ 													// SOME ERROR => USE OLD TOKEN
						mainWindow.webContents.send('dev-login:have-token', {tokenString: cookies[0].value, decoded: token});
					}
				});
			}
			else{								// TOKEN NOT EXPIRYING SOON
				mainWindow.webContents.send('dev-login:have-token', {tokenString: cookies[0].value, decoded: token});
			}		
		}
	});
}

module.exports.devLogin = devLogin;
module.exports.checkDevToken = checkDevToken;