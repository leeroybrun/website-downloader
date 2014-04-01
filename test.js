var Downloader = require('./lib/Downloader');

var downloader = new Downloader({
	dlDir: 'C:\\Users\\leeroy.brun\\Downloads\\{domain}'
});

downloader.start('http://www.cuevana.tv/');

downloader.on('error', function(error) {
	console.error(error);
});