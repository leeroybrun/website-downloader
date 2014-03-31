var request = require('request');
var cheerio = require('cheerio');
var async = require('async');
var util = require('util');
var EventEmitter = require('events').EventEmitter;

function Downloader(options) {
	this.options = options;

	// Processing stack
	this.stack = {
		html: [],
		css: [],
		js: [],
		nb: 0,
		processing: false
	};
}

util.inherits(Downloader, EventEmitter);

// Start downloader
Downloader.prototype.start = function() {
	var _this = this;

	// Called when stack need to be processed
	this.on('stack:process', function() {
		_this.stack.process();
	})
};

// Add one or more elements to the given stack
Downloader.prototype.stack.add = function(type, els) {
	els = (Array.isArray(els)) ? els : [els];

	this.stack[type] = this.stack[type].concat(els);
	this.stack.nb += els.length;

	this.emit('stack:process');
};

// Process the stack
Downloader.prototype.stack.process = function() {
	if(this.stack.processing) { return; } // Already processing stack

	var _this = this;

	async.whilst(
	    function processWhileTest() { return _this.stack.nb > 0; },
	    function processWhile(callback) {
	        if(this.stack.html.length > 0) {
				var stack = this.stack.html;
				var type = 'html';
			} else if(this.stack.js.length > 0) {
				var stack = this.stack.js;
				var type = 'js';
			} else if(this.stack.css.length > 0) {
				var stack = this.stack.css;
				var type = 'css';
			}

			var url = stack.pop();

			this.fetch(url, function(body) {
				_this.parse[type](body, function(err, result) {
					// Add results to stack
					_this.stack.add('html', result.html);
					_this.stack.add('js', result.js);
					_this.stack.add('css', result.css);

					_this.saveFile(url, body, function(err) {
						_this.stack.nb--;
						callback();
					});
				});
			});
	    },
	    function processWhileEnd(err) {
	        // Finished processing stack
			this.stack.processing = false;
	    }
	);
};

// Parse an URL and return a filename for it
Downloader.prototype.urlToFilename = function(url) {

};

// Download the given URL and return the data
Downloader.prototype.fetch = function(url, callback) {

};

Downloader.prototype.parse = {};

// Parse HTML pages, get images/css/js files URLs, replace with local filenames & return elements to be stacked and modified page contents
Downloader.prototype.parse.html = function(body) {
	
};