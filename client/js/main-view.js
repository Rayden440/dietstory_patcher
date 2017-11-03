window.Hammer = require('hammerjs');
window.$ = window.jQuery = require('jquery');

const electron = require('electron');
const {ipcRenderer} = electron;

$(document).ready(function(){
	// INITIALIZE COLLAPSE BUTTON
	$(".button-collapse").sideNav({
		menuWidth: 300,
		edge: 'left',
		closeOnClick: true,
		draggable: false
	});

	// INITIALIZE MODAL
	$('.modal').modal();
});


// HANDLES DEV LOGIN
function devLogin(){
	// SENDS LOGIN CREDENTIALS TO main.js
	ipcRenderer.send('dev-login:attemp',{username: $('#dev-login-username').val(), password: $('#dev-login-password').val()});
}

// HANDLE RESPONSE FROM main.js
ipcRenderer.on('dev-login:success', function(event){
	console.log('login success');
	$('#body-fragment').attr('src', 'dev_fragment.html');
});
ipcRenderer.on('dev-login:failure', function(event, err){
	alert(JSON.stringify(err));
});