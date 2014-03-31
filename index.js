var Downloader = require('./lib/Downloader');
var prompt = require('prompt');

prompt.start();
		
prompt.get(['url'], function (err, result) {
	var downloader = new Downloader();

	downloader.start(result.url);

	downloader.on('error', function(error) {
		console.error(error);
	});
});