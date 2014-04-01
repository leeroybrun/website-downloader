var util = require('util');
var async = require('async');
var EventEmitter = require('events').EventEmitter;

function Stack() {
	// Default stack values
	this.stack = {
		html: [],
		css: [],
		js: [],
		files: []
	};

	this.nb = 0;
	this.processing = false;
}

util.inherits(Stack, EventEmitter);

// Add one or more elements to the given stack
Stack.prototype.add = function(type, els) {
	els = (Array.isArray(els)) ? els : [els];

	this.stack[type] = this.stack[type].concat(els);
	this.nb += els.length;

	this.emit('itemsAdded');
};

// Process the stack
Stack.prototype.process = function(inst, processItem) {
	var _this = this;

	if(_this.processing) { return; } // Already processing stack

	_this.processing = true;

	async.whilst(
	    function processWhileTest() { return _this.nb > 0; },
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

			inst[processItem](type, url, function() {
				_this.nb--;
				cbw();
			});
	    },
	    function processWhileEnd(err) {
	        // Finished processing stack
			_this.processing = false;
	    }
	);
};

module.exports = Stack;