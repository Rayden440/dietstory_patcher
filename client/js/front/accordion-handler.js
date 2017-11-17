function refreshAccordion(){
	const newLabel = '<div class="ui blue mini basic label float-right">New</div>';
	const changedLabel = '<div class="ui orange mini basic label float-right">Changed</div>';

	async.waterfall([
		// READING THE TEMPLATE FILE
		function(next){
			fs.readFile(fragmentsDir +'accordion-entry-template-dev.html', 'utf8', function(err, template){
				next(null, template);
			});
		},

		// GENERATING HTML
		function(template, next){
			var html = '';

			for(let value of newFiles.values()){
				html += generateAccordionEntry(template, newLabel, value);
			}
			for(let value of trackedFiles.values()){
				html += generateAccordionEntry(template, '', value);
			}

			next(null, html);
		}
	], 
	// FINAL FUNCTION OF WATERFALL
	function(err, html){
		$('#dev-file-info-accordion').html(html).accordion();
	});
}





function generateAccordionEntry(template, label, fileInfo){
	let temp = template;
	const timeString = new Date(fileInfo.last_changed).toString().replace(/.{3}\s/, '').replace(/:\d\d\s/, ' ').replace(/00\s.*/, '').replace(/(\s\d{1,2})(\s)/g, '$1, ').replace(/(\S{3}.)(0)/g, '$1');

	temp = temp.replace(/\{FILE_NAME\}/g, fileInfo.name);
	temp = temp.replace(/\{PATH\}/g, fileInfo.path);
	temp = temp.replace(/\{LINK\}/g, fileInfo.link);
	temp = temp.replace(/\{LAST_MODIFIED\}/g, timeString);
	temp = temp.replace(/\{HASH\}/g, fileInfo.sha256);
	temp = temp.replace(/\{LABEL\}/g, label);
	temp += '\n';

	return temp;
}