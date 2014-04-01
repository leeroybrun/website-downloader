var fs = require('fs');
var path = require('path');
var Request = require('delayed-request');
var mkdirp = require('mkdirp');
var status = {update: function(){}};//require('terminal-status');
var util = require('util');
var EventEmitter = require('events').EventEmitter;

var Stack = require('./Stack');
var parser = new (require('./Parser'))();
var helpers = require('./helpers');

var defaultOptions = {
	dlDir: 'download/{domain}'
};

function Downloader(options) {
	this.options = helpers.extend({}, defaultOptions, options) || helpers.extend({}, defaultOptions);

	this.defaults = {
		dlDir: this.options.dlDir
	};

	this.stack = new Stack();

	this._request = new Request({
		delayMin: 1000,
		delayMax: 3000
	});
}

util.inherits(Downloader, EventEmitter);

// Start downloader
Downloader.prototype.start = function(url) {
	var _this = this;

	status.update({ title: 'Downloading '+ url+'...', action: 'Starting...'});

	// Called when stack need to be processed
	this.stack.on('itemsAdded', function() {
		_this.stack.process(_this, 'processItem');
	});

	this.options.baseUrl = url;

	this.options.dlDir = this.defaults.dlDir.replace('{domain}', helpers.getDomain(url));

	mkdirp(this.options.dlDir, function(err) {
		_this.stack.add('html', url);
	});
};

Downloader.prototype.processItem = function(type, url, callback) {
	var _this = this;

	status.update({ action: 'Processing ('+type+') '+ url +' ('+ this.stack.nb +' remaining)...', subaction: 'Fetching...'});

	_this.fetch(url, function(err, body) {
		status.update({ subaction: 'Parsing...'});

		console.log(type, url);

		parser[type](url, body, function(err, result) {

			// Add results to stack
			_this.stack.add('html', result.html);
			_this.stack.add('js', result.js);
			_this.stack.add('css', result.css);
			_this.stack.add('files', result.files);

			status.update({ subaction: 'Parsed ! Now saving...'});

			_this.saveFile(url, result.body, callback);
		});
	});
};

// Download the given URL and return the data
Downloader.prototype.fetch = function(url, callback) {
	var _this = this;

	this._request.run({
		method: 'GET',
		url: url,
		headers: {
			'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_9_0) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/33.0.1750.152 Safari/537.36'
		}
	}, function(error, response, body) {
		callback(error, body);
	});
};

Downloader.prototype.saveFile = function(url, body, callback) {
	var _this = this;

	var fileName = helpers.urlToFilename(url);

	fs.writeFile(path.join(this.options.dlDir, fileName), body, callback); 
};

module.exports = Downloader;