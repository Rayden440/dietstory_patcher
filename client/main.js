const electron = require('electron');
const url = require('url');
const path = require('path');
const dotenv = require('dotenv');
const request = require('request');

// LOADS ENVIRONMENT VARIABLES
dotenv.config();
process.env.NODE_TLS_REJECT_UNAUTHORIZED="0";

const {app, BrowserWindow, Menu, ipcMain} = electron;

let mainWindow;

// LISTEN FOR APP READY
app.on('ready', function(){

	// CREATES WINDOW
	mainWindow = new BrowserWindow({
		minHeight: 600,
		minWidth: 800
	});

	// LOAD HTML
	mainWindow.loadURL(url.format({
		pathname: path.join(__dirname, '/html/main.html'),
		protocol: 'file:',
		slashes: true
	}));

	// CLOSE APP WHEN mainWindow IS CLOSED - PREVENTS DANGLING WINDOWS
	mainWindow.on('closed', function(){
		app.quit();
	});

	// REMOVING MENU BAR IF IN PRODUCTION MODE
	if(process.env.ELECTRON_MODE === 'prod')
		Menu.setApplicationMenu(null);
});


// HANDLES login:dev FROM ipcRenderer
ipcMain.on('login:dev', function(event, credentials){

	let options = {
		url: process.env.DS_WEB_SERVER_HOME +'/login/devs',
		method: 'POST',
		form: credentials
	}

	// POSTING TO SERVER
	request(options, function(err, res, body){
		// TODO: HANDLE RESPONSE FROM SERVER
	});
});