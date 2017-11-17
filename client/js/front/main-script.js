window.$ = window.jQuery = require('jquery');
const fs = require('fs');
const async = require('async');
const electron = require('electron');
const {ipcRenderer} = electron;

const fragmentsDir = __dirname + '/fragments/';
var trackedFiles = new Array();
var newFiles = new Array();
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
	enterNormalMode();
});

$(document).on('click', '#dev-login-modal-trigger', function(){
	ipcRenderer.send('dev-login:check-token');
});
$(document).on('click', '#dev-login-modal-trigger', function(){
	ipcRenderer.send('dev-login:check-token');
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

// CLICKING ON 'Add Files' IN DEV MODE BRINGS UP THE MODAL TO ADD UNTRACKED FILES
$(document).on('click', '#dev-add-files-btn', function(){
	$('#dev-add-files-modal').modal('show');
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
	let files = $('#dev-add-files-input').get(0).files;
	let fileInfo = new Array();

	for(let i = 0; i < files.length; i++){
		fileInfo.push({
			last_changed: files[i].lastModified,
			name: files[i].name,
			path: files[i].path,
			size: files[i].size
		});
	}

	$('#dev-add-files-input').val('');	// )
	files = null;						// ) CLEARING SELECTED FILES IN THE FORM
	countUntrackedFiles(null);			// )

	ipcRenderer.send('dev-add-untracked-files:generate-hash', fileInfo);
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
	if(files && files.length > 1){
		$('#dev-add-files-label').html('<i class="upload icon"></i> ' +files.length +' files selected');
		$('#dev-add-files-modal-next-btn').removeClass('disabled');
	}
	else if(files && files.length == 1){
		$('#dev-add-files-label').html('<i class="upload icon"></i> ' +files[0].name);
		$('#dev-add-files-modal-next-btn').removeClass('disabled');
	}
	else{
		$('#dev-add-files-label').html('<i class="upload icon"></i> Select File(s)');
		$('#dev-add-files-modal-next-btn').addClass('disabled');
	}
}












/*
      _           _                                          _       
  ___| | ___  ___| |_ _ __ ___  _ __     _____   _____ _ __ | |_ ___ 
 / _ \ |/ _ \/ __| __| '__/ _ \| '_ \   / _ \ \ / / _ \ '_ \| __/ __|
|  __/ |  __/ (__| |_| | | (_) | | | | |  __/\ V /  __/ | | | |_\__ \
 \___|_|\___|\___|\__|_|  \___/|_| |_|  \___| \_/ \___|_| |_|\__|___/

*/


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

// FILE INFO FROM THE MAIN PROCESS => SET AS GLOBAL ARRAY
ipcRenderer.on('file-info:set-info', function(event, info){
	console.log(info);
	trackedFiles = info;
});

// FILE HASING COMPLETE => ADD TO NEW FILES ARRAY
ipcRenderer.on('dev-add-untracked-files:hash-complete', function(event, info){
	console.log(info);
	newFiles = info;
	refreshAccordion();
});

// COOKIE REMOVED USER IS NO LONGER AUTHORIZED
ipcRenderer.on('dev-logout:cookie-removed', function(event){
	devToken = null; 
	devUserInfo = null;
	enterNormalMode();
	$('#sidebar').sidebar('toggle');
});