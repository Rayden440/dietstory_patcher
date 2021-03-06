window.$ = window.jQuery = require('jquery');
const electron = require('electron');
const async = require('async');
const path = require('path');
const fs = require('fs');
const {ipcRenderer} = electron;

const fragmentsDir = __dirname + '/fragments/';
var startingDir;
var trackedFiles = new Map();
var changedFiles = new Map();
var newFiles = new Map();
var devToken, devUserInfo;

/*
   _  ___                        
  (_)/ _ \ _   _  ___ _ __ _   _ 
  | | | | | | | |/ _ \ '__| | | |
  | | |_| | |_| |  __/ |  | |_| |
 _/ |\__\_\\__,_|\___|_|   \__, |
|__/                       |___/ 

*/
$(document).ready(function(){
	ipcRenderer.send('files-info:get-info');
	ipcRenderer.send('app-info:get-location');
	enterNormalMode();
});

// CLICKING ON 'Dev Mode' IN THE SIDEBAR => BRINGS UP LOGIN PROMPT
$(document).on('click', '#dev-login-modal-trigger', function(){
	ipcRenderer.send('dev-login:check-token');
});

// CLICKING ON LOGIN BUTTON ON THE DEV LOGIN MODAL
$(document).on('click', '#dev-login-modal-btn', function(){
	devLogin();
});

// CLICKING ON 'Exit Dev Mode' IN THE SIDEBAR
$(document).on('click', '#exit-dev-mode-btn', function(){
	enterNormalMode();
	$('#sidebar').sidebar('toggle');
});

// CLICKING ON 'Logoff' BUTTON IN DEV MODE
$(document).on('click', '#dev-logout-btn', function(){
	ipcRenderer.send('dev-logout:remove-cookie');
});

// CLICKING ON MENU BUTTON => BRINGS OUT SIDEBAR
$(document).on('click', '#sidebar-toggle-btn', function(){
	$('#sidebar').sidebar('setting', 'transition', 'overlay').sidebar('toggle');
});

// CLICKING ON 'New Files' IN DEV MODE BRINGS UP THE MODAL TO ADD UNTRACKED FILES
$(document).on('click', '#dev-add-files-btn', function(){
	$('#dev-add-files-modal').modal('show');
});

// CLICKING ON 'Scan for Changes' IN DEV MODE => CHECKS FILES IN THE FRACKED LIST FOR CHANGES
$(document).on('click', '#dev-scan-files-btn', function(){
	scanFiles();
});

// BRINGS UP THE WINDOW TO ALLOW FILE SELECTIONS
$(document).on('click', '#dev-add-files-label', function(){
	$('#dev-add-files-input').click();
});

// WHEN FILES ARE SELECTED, COUNT THE FILES AND ENABLE 
$(document).on('change', '#dev-add-files-input', function(e){
	countUntrackedFiles(e.target.files);
});

// LET THE MAIN PROCESS CREATE HASH FOR THE FILES
$(document).on('click', '#dev-add-files-modal-next-btn', function(){
	addFiles();
});

// SENDS NEW FILES AND CHANGED FILES TO 
$(document).on('click', '#dev-upload-files-btn', function(){
	upload();
});











/*
 _          _                    __                  _   _                 
| |__   ___| |_ __   ___ _ __   / _|_   _ _ __   ___| |_(_) ___  _ __  ___ 
| '_ \ / _ \ | '_ \ / _ \ '__| | |_| | | | '_ \ / __| __| |/ _ \| '_ \/ __|
| | | |  __/ | |_) |  __/ |    |  _| |_| | | | | (__| |_| | (_) | | | \__ \
|_| |_|\___|_| .__/ \___|_|    |_|  \__,_|_| |_|\___|\__|_|\___/|_| |_|___/
             |_|                                                           

*/

// HANDLES DEV LOGIN
function devLogin(){
	const user = $('#dev-login-username').val();
	const pass = $('#dev-login-password').val();

	// VALIDATING FORM
	if(user == '' || pass == ''){
		// DO NOT POST EMPTY FIELDS TO SERVER
	}
	else{
		// SENDS LOGIN CREDENTIALS TO main.js
		ipcRenderer.send('dev-login:attemp',{username: user, password: pass});
		$('#dev-login-password').val('');
	}
}

// USING JQUERY TO LOAD SIDEBAR AND PAGE CONTENT LUL
function enterNormalMode(){
	async.parallel({
		pusher: function(callback){
			fs.readFile(fragmentsDir +'pusher-common.html', 'utf8', function(err, html){
				callback(err, html);
			});
		},
		sidebar: function(callback){
			fs.readFile(fragmentsDir +'sidebar-common.html', 'utf8', function(err, html){
				callback(err, html);
			});
		}
	}, 
	// FINAL FUNCTION OF PARALLEL
	function(err, results){
		$('#sidebar').html(results.sidebar);
		$('#pusher').html(results.pusher);
		$('#footer').html('');
	});
}

// SAME AS ABOVE BUT FOR DEV MODE
function enterDevMode(){
	$('#sidebar').sidebar('toggle');
	$('#dev-login-modal').modal('hide');

	async.parallel({
		pusher: function(callback){
			fs.readFile(fragmentsDir +'pusher-dev.html', 'utf8', function(err, html){
				callback(err, html);
			});
		},
		sidebar: function(callback){
			fs.readFile(fragmentsDir +'sidebar-dev.html', 'utf8', function(err, html){
				callback(err, html);
			});
		},
		footer: function(callback){
			fs.readFile(fragmentsDir +'footer-dev.html', 'utf8', function(err, html){
				callback(err, html);
			});
		}
	}, 
	// FINAL FUNCTION OF PARALLEL
	function(err, results){
		results.sidebar = results.sidebar.replace(/\{DEV_USERNAME\}/g, devUserInfo.username);
		$('#sidebar').html(results.sidebar);
		$('#pusher').html(results.pusher);
		$('#footer').html(results.footer);
		refreshAccordion();
	});
}

// CHANGES TEXT ON BUTTON OF FILE SELECTION BUTTON IN #dev-add-files-modal
function countUntrackedFiles(files){
	if(files && files.length > 0){
		$('#dev-add-files-label').html('<i class="upload icon"></i> ' +files.length +' file(s) selected');
		$('#dev-add-files-modal-next-btn').removeClass('disabled');
	}
	else{
		$('#dev-add-files-label').html('<i class="upload icon"></i> Select File(s)');
		$('#dev-add-files-modal-next-btn').addClass('disabled');
	}
}

// GENERATE A LIST OF DUPLICATES AND UNIQUES, UNIQUE FILES ARE SENT TO THE MAIN PROCESS FOR HASH GENERATION
function addFiles(){
	let files = $('#dev-add-files-input').get(0).files;
	let uniqueFiles = new Array();
	let duplicates = new Array();
	let rejected = new Array();

	for(let i = 0; i < files.length; i++){
		let relativePath = './' +path.relative(startingDir, files[i].path).replace(/\\/g, '/');

		if(trackedFiles.has(relativePath)){
			duplicates.push({name: files[i].name, fullPath: files[i].path});
		}
		else if(relativePath.indexOf('..') > -1){
			rejected.push({name: files[i].name, fullPath: files[i].path});
		}
		else{
			uniqueFiles.push({
				last_changed: files[i].lastModified,
				name: files[i].name,
				path: files[i].path,
				size: files[i].size
			});
		}
	}

	$('#dev-add-files-input').val('');	// )
	files = null;						// ) CLEARING SELECTED FILES IN THE FORM
	countUntrackedFiles(null);			// )

	async.waterfall([

		// DISPLAY REJECTED FILES
		function(next){
			if(rejected.length > 0){
				let listHTML = '';

				fs.readFile(fragmentsDir + 'duplicate-files-list-template-dev.html', 'utf8', function(err, template){
					for(let i = 0; i < rejected.length; i++){
						let temp = template;
						temp = temp.replace(/\{FILE_NAME\}/g, rejected[i].name);
						temp = temp.replace(/\{FULL_PATH\}/g, rejected[i].fullPath);
						listHTML += temp +'\n';
					}
					$('#rejected-files-list').html(listHTML);
					$('#dev-add-files-rejected-modal').modal({
						closable: false,
						onApprove: function(){next(null);}
					}).modal('show');
				});	
			}
			else{
				next(null);
			}
		},

		// DISPLAY DUPLICATE FILES
		function(next){
			if(duplicates.length > 0){
				let listHTML = '';

				fs.readFile(fragmentsDir + 'duplicate-files-list-template-dev.html', 'utf8', function(err, template){
					for(let i = 0; i < duplicates.length; i++){
						let temp = template;
						temp = temp.replace(/\{FILE_NAME\}/g, duplicates[i].name);
						temp = temp.replace(/\{FULL_PATH\}/g, duplicates[i].fullPath);
						listHTML += temp +'\n';
					}
					$('#duplicate-files-list').html(listHTML);
					$('#dev-add-files-duplicates-modal').modal({
						closable: false,
						onApprove: function(){next(null);}
					}).modal('show');
				});
			}
			else{
				next(null);
			}
		}
	], 
	// SEND LIST OF FILE TO MAIN PROCESS TO CALCULATE HASHES
	function(err){
		if(uniqueFiles.length > 0){
			$('#dev-add-files-loading-modal').modal({
				closable: false,
				onVisible: function(){ipcRenderer.send('dev-add-untracked-files:generate-hash', uniqueFiles);}
			}).modal('show');
		}
	});
}

// SCANS FILES IN trackedFiles FOR CHANGED FILES
function scanFiles(){
	let fileList = new Array();

	for(let file of trackedFiles.values()){
		fileList.push(file);
	}

	$('#dev-scan-files-loading-modal').modal({closable: false}).modal('show');
	ipcRenderer.send('dev-scan-files:find-difference', fileList);
}

// SENDS A LIST OF FILES IN NEW AND CHANGED MAP
function upload(){
	let files = {
		new: new Array(),
		changed: new Array()
	};

	for(let value of newFiles.values()){
		files.new.push(value);
	}

	for(let value of changedFiles.values()){
		files.changed.push(value);
	}

	ipcRenderer.send('dev-upload-files:start-upload', files);
}












/*
      _           _                                          _       
  ___| | ___  ___| |_ _ __ ___  _ __     _____   _____ _ __ | |_ ___ 
 / _ \ |/ _ \/ __| __| '__/ _ \| '_ \   / _ \ \ / / _ \ '_ \| __/ __|
|  __/ |  __/ (__| |_| | | (_) | | | | |  __/\ V /  __/ | | | |_\__ \
 \___|_|\___|\___|\__|_|  \___/|_| |_|  \___| \_/ \___|_| |_|\__|___/

*/

// SETS THE APP'S STARTING LOCATION
ipcRenderer.on('app-info:set-location', function(event, dir){
	startingDir = dir;
});

// HANDLE SUCCESS EVENT FROM main.js => 
ipcRenderer.on('dev-login:success', function(event, response){
	devToken = response.tokenString;
	devUserInfo = {
		id: response.decoded.id,
		username: response.decoded.username
	};

	enterDevMode();
});

// HANDLES FAILURE EVENT FROM main.js => DISPLAY ERROR
ipcRenderer.on('dev-login:failure', function(event, err){
	$('#dev-login-modal-error-message').text(err.reason);
	$('#dev-login-modal-form').addClass('error');
});

// HANDLES NO TOKEN EVENT FROM main.js => OPEN LOGIN PROMPT
ipcRenderer.on('dev-login:no-token', function(event){
	$('#dev-login-modal').modal('show');
});

// HANDLES HAVE TOKEN EVENT FROM main.js => CHANGE INTO DEV MODE
ipcRenderer.on('dev-login:have-token', function(event, response){
	devToken = response.tokenString;
	devUserInfo = {
		id: response.decoded.id,
		username: response.decoded.username
	};

	enterDevMode();
});

// FILE INFO FROM THE MAIN PROCESS => SET AS GLOBAL MAP
ipcRenderer.on('file-info:set-info', function(event, info){
	for(let i = 0; i < info.length; i++){
		trackedFiles.set(info[i].path, info[i]);
	}
});

// FILE HASING COMPLETE => ADD TO NEW FILES MAP
ipcRenderer.on('dev-add-untracked-files:hash-complete', function(event, info){
	$('#dev-upload-files-btn').removeClass('disabled');
	for(let i = 0; i < info.length; i++){
		newFiles.set(info[i].path, info[i]);
	}
	refreshAccordion();
	$('#dev-add-files-loading-modal').modal('hide');
});

// COOKIE REMOVED USER IS NO LONGER AUTHORIZED
ipcRenderer.on('dev-logout:cookie-removed', function(event){
	devToken = null; 
	devUserInfo = null;
	enterNormalMode();
	$('#sidebar').sidebar('toggle');
});

// SCAN PROCESS COMPLETE => DISPLAY CHANGED FILES
ipcRenderer.on('dev-scan-files:changed-files', function(event, changed){
	for(var i = 0; i < changed.length; i++){
		trackedFiles.delete(changed[i].path);
		changedFiles.set(changed[i].path, changed[i]);
	}

	if(changed.length > 0){
		$('#dev-upload-files-btn').removeClass('disabled');
	}

	refreshAccordion();
	$('#dev-scan-files-loading-modal').modal('hide');
});