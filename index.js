var Downloader = require('./Downloader');
var prompt = require('prompt');

prompt.start();
		
prompt.get(['url'], function (err, result) {
	var downloader = new Downloader(result);
	downloader.start();

	downloader.on('error', function(error) {
		console.error(error);
	});
});