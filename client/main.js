const electron = require('electron');
const url = require('url');
const path = require('path');

const {app, BrowserWindow, Menu} = electron;

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

	// REMOVING MENU BAR
	Menu.setApplicationMenu(null);
});