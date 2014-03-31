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

Downloader.prototype.start = function() {
	var _this = this;

	// Called when stack need to be processed
	this.on('stack:process', function() {
		_this.stack.process();
	})
};

Downloader.prototype.stack.add = function(type, el) {
	this.stack[type].push(el);
	this.stack.nb++;

	this.emit('stack:process');
};

Downloader.prototype.stack.process = function() {
	if(this.stack.processing) { return; } // Already processing stack

	while(this.stack.nb > 0) {
		
	}

	// Finished processing stack
	this.stack.processing = false;
};

Downloader.prototype.fetch = function(url) {

};

Downloader.prototype.parseHTML = function(body) {

};