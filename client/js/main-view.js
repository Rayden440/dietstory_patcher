$(document).ready(function(){
	// INITIALIZE COLLAPSE BUTTON
	$(".button-collapse").sideNav({
		menuWidth: 300,
		edge: 'left',
		closeOnClick: true,
		draggable: false
	});

	$('.modal').modal();
});