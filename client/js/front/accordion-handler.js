function refreshAccordion(){
	const newLabel = '<div class="ui blue mini basic label float-right">New</div>';
	const changedLabel = '<div class="ui orange mini basic label float-right">Changed</div>';

	async.waterfall([
		// READING THE TEMPLATE FILE
		function(next){
			fs.readFile(fragmentsDir +'accordion-entry-template-dev.html', 'utf8', function(err, template){
				next(null, template, '');
			});
		},

		// GENERATING HTML FOR NEW FILES
		function(template, html, next){
			let temp = ''

			async.eachSeries(newFiles, function(singleFileInfo, callback){
				temp = template;
				// FORMATING STRING: DONT ASK LOL
				var timeString = new Date(singleFileInfo.last_changed).toString().replace(/.{3}\s/, '').replace(/:\d\d\s/, ' ').replace(/00\s.*/, '').replace(/(\s\d{1,2})(\s)/g, '$1, ').replace(/(\S{3}.)(0)/g, '$1');

				temp = temp.replace(/\{FILE_NAME\}/g, singleFileInfo.name);
				temp = temp.replace(/\{PATH\}/g, singleFileInfo.path);
				temp = temp.replace(/\{LINK\}/g, singleFileInfo.link);
				temp = temp.replace(/\{LAST_MODIFIED\}/g, timeString);
				temp = temp.replace(/\{HASH\}/g, singleFileInfo.sha256);
				temp = temp.replace(/\{LABEL\}/g, newLabel);
				
				html += temp +'\n';
				callback();
			}, 
			function(){
				next(null, template, html);
			});
		},

		// GENERATING HTML FOR UNCHANGED FILES
		function(template, html, next){
			let temp = '';

			async.eachSeries(trackedFiles, function(singleFileInfo, callback){
				temp = template;
				var timeString = new Date(singleFileInfo.last_changed).toString().replace(/.{3}\s/, '').replace(/:\d\d\s/, ' ').replace(/00\s.*/, '').replace(/(\s\d{1,2})(\s)/g, '$1, ').replace(/(\S{3}.)(0)/g, '$1');

				temp = temp.replace(/\{FILE_NAME\}/g, singleFileInfo.name);
				temp = temp.replace(/\{PATH\}/g, singleFileInfo.path);
				temp = temp.replace(/\{LINK\}/g, singleFileInfo.link);
				temp = temp.replace(/\{LAST_MODIFIED\}/g, timeString);
				temp = temp.replace(/\{HASH\}/g, singleFileInfo.sha256);
				temp = temp.replace(/\{LABEL\}/g, '');
				
				html += temp +'\n';
				callback();
			}, 
			function(){
				next(null, html);
			});
		}
	], 
	// FINAL FUNCTION OF WATERFALL
	function(err, html){
		$('#dev-file-info-accordion').html(html).accordion();
	});
}