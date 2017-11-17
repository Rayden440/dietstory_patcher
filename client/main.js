const electron = require('electron');
const url = require('url');
const path = require('path');
const dotenv = require('dotenv');
const loginHandler = require('./js/back/login-handler');
const fileHandler = require('./js/back/file-handler');
const netHandler = require('./js/back/net-handler');

// LOADS ENVIRONMENT VARIABLES
dotenv.config();
process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';
process.env.ELECTRON_STARTING_DIRECTORY = 'C:\\Nexon\\MapleStory'; 	// REPLACE WITH __dirname IN PRODUCTION!!

const {app, BrowserWindow, Menu, ipcMain, session} = electron;

let mainWindow;

// LISTEN FOR APP READY
app.on('ready', function(){

	// CREATES WINDOW
	mainWindow = new BrowserWindow({
		height: 600,
		width: 1000,
		minHeight: 600,
		minWidth: 1000,
		show: false
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

	//session.defaultSession.cookies.remove('https://127.0.0.1', 'dev_token', function(){});

	// SHOWS WINDOW ONLY AFTER HTML FINISH LOADING - FEELS LESS LAGGY
	mainWindow.once('ready-to-show', function(){
		mainWindow.show();
	});

	// REMOVING MENU BAR IN PRODUCTION MODE
	if(process.env.ELECTRON_MODE === 'prod')
		Menu.setApplicationMenu(null);
});



// HANDLES dev-login:check-token FROM ipcRenderer
ipcMain.on('dev-login:check-token', function(event){
	loginHandler.checkDevToken(mainWindow, session);
});

// HANDLES dev-login:attemp FROM ipcRenderer
ipcMain.on('dev-login:attemp', function(event, credentials){
	loginHandler.devLogin(mainWindow, session, credentials);
});

// HANDLES dev-add-untracked-files:generate-hash FROM ipcRenderer
ipcMain.on('dev-add-untracked-files:generate-hash', function(event, files){
	fileHandler.generateHash(mainWindow, files);
});

// REQUEST SERVER FOR ALL INFO ON TRACKED FILES
ipcMain.on('files-info:get-info', function(event){
	netHandler.getFileInfo(mainWindow);
});

// LOGOUT FROM DEVELOPER
ipcMain.on('dev-logout:remove-cookie', function(event){
	session.defaultSession.cookies.remove(process.env.DS_WEB_SERVER_HOME, 'dev_token', function(){
		mainWindow.webContents.send('dev-logout:cookie-removed');
	});
});

// LETS THE RENDERER KNOW WHERE THE APP IS LOCATED
ipcMain.on('app-info:get-location', function(event){
	mainWindow.webContents.send('app-info:set-location', process.env.ELECTRON_STARTING_DIRECTORY);
});