var fs = require('fs');
var path = require('path');
var Request = require('delayed-request');
var cheerio = require('cheerio');
var async = require('async');
var status = require('terminal-status');
var util = require('util');
var EventEmitter = require('events').EventEmitter;

var defaultOptions = {
	dlDir: 'download/'
};

function Downloader(options) {
	this.options = this.helpers.extend({}, defaultOptions, options) || this.helpers.extend({}, defaultOptions);

	// Default stack values
	this.stack.html = [];
	this.stack.css = [];
	this.stack.js = [];
	this.stack.files = [];

	this.stack.nb = 0;
	this.stack.processing = false;

	this._request = new Request({
		delayMin: 1000,
		delayMax: 3000
	});

	// Add references to main instance for "sub-objects"
	this.stack._this = this;
	this.parse._this = this;
}

util.inherits(Downloader, EventEmitter);

// Start downloader
Downloader.prototype.start = function(url) {
	var _this = this;

	// Called when stack need to be processed
	this.on('stack:process', function() {
		_this.stack.process();
	});

	this.options.baseUrl = url;

	this.stack.add('html', url);
};

Downloader.prototype.stack = {};

// Add one or more elements to the given stack
Downloader.prototype.stack.add = function(type, els) {
	var _this = this._this;

	els = (Array.isArray(els)) ? els : [els];

	_this.stack[type] = _this.stack[type].concat(els);
	_this.stack.nb += els.length;

	_this.emit('stack:process');
};

// Process the stack
Downloader.prototype.stack.process = function() {
	var _this = this._this;

	if(_this.stack.processing) { return; } // Already processing stack

	_this.stack.processing = true;

	async.whilst(
	    function processWhileTest() { return _this.stack.nb > 0; },
	    function processWhile(cbw) {
	    	// Prioritize HTML, then JS and then CSS
	        if(_this.stack.html.length > 0) {
				var stack = _this.stack.html;
				var type = 'html';
			} else if(_this.stack.js.length > 0) {
				var stack = _this.stack.js;
				var type = 'js';
			} else if(_this.stack.css.length > 0) {
				var stack = _this.stack.css;
				var type = 'css';
			} else if(_this.stack.files.length > 0) {
				var stack = _this.stack.files;
				var type = 'files';
			}

			var url = stack.pop();

			_this.fetch(url, function(err, body) {
				_this.parse[type](url, body, function(err, result) {
					// Add results to stack
					_this.stack.add('html', result.html);
					_this.stack.add('js', result.js);
					_this.stack.add('css', result.css);
					_this.stack.add('files', result.files);

					_this.saveFile(url, result.body, function(err) {
						_this.stack.nb--;
						cbw();
					});
				});
			});
	    },
	    function processWhileEnd(err) {
	        // Finished processing stack
			_this.stack.processing = false;
	    }
	);
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

Downloader.prototype.parse = {};

Downloader.prototype.parse.defaultResult = {
	html: [],
	js: [],
	css: [],
	files: [],
	body: null
};

// Parse HTML pages, get images/css/js files URLs, replace with local filenames & return elements to be stacked and modified page contents
Downloader.prototype.parse.html = function(url, body, callback) {
	var _this = this._this;

	var result = Object.create(_this.parse.defaultResult);

	var $ = cheerio.load(body);

	var $base = $('base');
	var baseUrl;
	if($base.length > 0) {
		baseUrl = $base.attr('href');
	} else {
		baseUrl = url.substring(0, url.lastIndexOf('/')+1)
	}

	baseUrl = (url[url.length-1] !== '/') ? baseUrl+'/' : baseUrl;

	console.log('baseUrl', baseUrl);

	// Get CSS files
	var cssFiles = $('link[rel=stylesheet]');

	console.log(cssFiles);

	result.body = $.html();

	callback(null, result);
};

// Parse CSS files
Downloader.prototype.parse.css = function(url, body, callback) {
	var _this = this._this;

	var result = Object.create(_this.parse.defaultResult);

	// Get CSS files

};

// Parse JS files
Downloader.prototype.parse.js = function(url, body, callback) {
	var _this = this._this;

	var result = Object.create(_this.parse.defaultResult);

	// Get CSS files

};

// Parse files (images, etc)
Downloader.prototype.parse.files = function(url, body, callback) {
	var _this = this._this;
	var result = Object.create(_this.parse.defaultResult);

	result.body = body;

	callback(null, result);
};

Downloader.prototype.saveFile = function(url, body, callback) {
	var _this = this;

	var fileName = this.helpers.urlToFilename(url);

	fs.writeFile(path.join(this.options.dlDir, fileName), body, callback); 
};

Downloader.prototype.helpers = {};

Downloader.prototype.helpers.extend = function(target) {
    var sources = [].slice.call(arguments, 1);
    sources.forEach(function (source) {
        for (var prop in source) {
            target[prop] = source[prop];
        }
    });
    return target;
};

// Parse an URL and return a filename for it
Downloader.prototype.helpers.urlToFilename = function(url) {
	var name = (url.lastIndexOf('/')+1 < url.length) ? url.substring(url.lastIndexOf('/')+1) : 'index.html';

	return name;
};

Downloader.prototype.helpers.getDomain = function(url) {
	return url.match(/^https?\:\/\/([^\/?#]+)(?:[\/?#]|$)/i)[1];
};

module.exports = Downloader;