window.$ = window.jQuery = require('jquery');
const fs = require('fs');
const async = require('async');
const electron = require('electron');
const {ipcRenderer} = electron;

const fragmentsDir = __dirname + '/../html/fragments/';


/*
   _  ___                        
  (_)/ _ \ _   _  ___ _ __ _   _ 
  | | | | | | | |/ _ \ '__| | | |
  | | |_| | |_| |  __/ |  | |_| |
 _/ |\__\_\\__,_|\___|_|   \__, |
|__/                       |___/ 

*/
$(document).ready(function(){
	enterNormalMode();
});

// CLICKING ON 'Dev Mode' IN THE SIDEBAR => BRINGS UP LOGIN PROMPT
$(document).on('click', '#dev-login-modal-trigger', function(){
	ipcRenderer.send('dev-login:check-token');
});

// CLICKING ON MENU BUTTON => BRINGS OUT SIDEBAR
$(document).on('click', '#sidebar-toggle-btn', function(){
	$('#sidebar').sidebar('setting', 'transition', 'overlay').sidebar('toggle');
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
		}
	}, 
	// FINAL FUNCTION OF PARALLEL
	function(err, results){
		$('#sidebar').html(results.sidebar);
		$('#pusher').html(results.pusher);
	});
}









/*
      _           _                                          _       
  ___| | ___  ___| |_ _ __ ___  _ __     _____   _____ _ __ | |_ ___ 
 / _ \ |/ _ \/ __| __| '__/ _ \| '_ \   / _ \ \ / / _ \ '_ \| __/ __|
|  __/ |  __/ (__| |_| | | (_) | | | | |  __/\ V /  __/ | | | |_\__ \
 \___|_|\___|\___|\__|_|  \___/|_| |_|  \___| \_/ \___|_| |_|\__|___/

*/


// HANDLE SUCCESS EVENT FROM main.js => 
ipcRenderer.on('dev-login:success', function(event){
	enterDevMode();
});

// HANDLES FAILURE EVENT FROM main.js => DISPLAY ERROR
ipcRenderer.on('dev-login:failure', function(event, err){
	$('#dev-login-modal-error-message').text(err.reason);
	$('#dev-login-modal-form').addClass('error');
});

// HANDLES NO TOKEN EVENT FROM main.js => OPEN LOGIN PROMPT
ipcRenderer.on('dev-login:no-token', function(event){
	$('#dev-login-modal').modal({
		onHide: function(){$('#sidebar').sidebar('toggle');}, 	// TOGGLES SIDEBAR TOO
		onApprove: function(){devLogin(); return false;}
	}).modal('show');
});

// HANDLES HAVE TOKEN EVENT FROM main.js => CHANGE INTO DEV MODE
ipcRenderer.on('dev-login:have-token', function(event){
	enterDevMode();
});