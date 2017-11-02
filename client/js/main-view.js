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
	ipcRenderer.send('login:dev',{username: $('#dev-login-username').val(), password: $('#dev-login-password').val()});
}