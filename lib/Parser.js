var cheerio = require('cheerio');
var async = require('async');

function Parser() {

}

Parser.prototype.defaultResult = {
	html: [],
	js: [],
	css: [],
	files: [],
	body: null
};

// Parse HTML pages, get images/css/js files URLs, replace with local filenames & return elements to be stacked and modified page contents
Parser.prototype.html = function(url, body, callback) {
	var _this = this;

	var result = Object.create(_this.defaultResult);

	var $ = cheerio.load(body);

	// Get base URL
	var $base = $('base');
	var baseUrl;
	if($base.length > 0) {
		baseUrl = $base.attr('href');
	} else {
		baseUrl = url.substring(0, url.lastIndexOf('/')+1)
	}

	// Get CSS files
	var cssFiles = $('link[rel=stylesheet]');

	console.log(cssFiles);

	result.body = $.html();

	callback(null, result);
};

// Parse CSS files
Parser.prototype.css = function(url, body, callback) {
	var _this = this._this;

	var result = Object.create(_this.parse.defaultResult);

	// Get CSS files

};

// Parse JS files
Parser.prototype.js = function(url, body, callback) {
	var _this = this._this;

	var result = Object.create(_this.parse.defaultResult);

	// Get CSS files

};

// Parse files (images, etc)
Parser.prototype.files = function(url, body, callback) {
	var _this = this._this;
	var result = Object.create(_this.parse.defaultResult);

	result.body = body;

	callback(null, result);
};

module.exports = Parser;