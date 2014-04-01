var cheerio = require('cheerio');
var async = require('async');
var helpers = require('./helpers');

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

	var result = helpers.cloneObject(this.defaultResult);

	var $ = cheerio.load(body);

	// Get base URL
	var $base = $('base');
	var baseUrl;
	if($base.length > 0) {
		baseUrl = $base.attr('href');
	} else {
		baseUrl = url.substring(0, url.lastIndexOf('/')+1)
	}

	// Get CSS files urls
	$('link[rel=stylesheet]').each(function(i, elem) {
		var url = $(this).attr('href');

		url = helpers.normalizeUrl(baseUrl, url);

		result.css.push(url);

		$(this).attr('href', helpers.urlToFilename(url));
	});

	// Get JS files urls
	$('script[src]').each(function(i, elem) {
		var url = $(this).attr('src');

		url = helpers.normalizeUrl(baseUrl, url);

		result.js.push(url);

		$(this).attr('src', helpers.urlToFilename(url));
	});

	// Get images urls
	$('img[src]').each(function(i, elem) {
		var url = $(this).attr('src');

		url = helpers.normalizeUrl(baseUrl, url);

		result.files.push(url);

		$(this).attr('src', helpers.urlToFilename(url));
	});

	result.body = $.html();

	callback(null, result);
};

// Parse CSS files
Parser.prototype.css = function(url, body, callback) {
	var result = helpers.cloneObject(this.defaultResult);

	var baseUrl = url.substring(0, url.lastIndexOf('/')+1);

	var imgRegex = /url\((.*?g)\)/ig;

	while ((match = imgRegex.exec(body)) !== null) {
		var imgUrl = helpers.normalizeUrl(baseUrl, match[1]);

		result.files.push(imgUrl);

		// TODO: why paths are not replaced here ??
		body.replace(match[1], helpers.urlToFilename(imgUrl));
	}

	result.body = body;

	callback(null, result);
};

// Parse JS files
Parser.prototype.js = function(url, body, callback) {
	var result = helpers.cloneObject(this.defaultResult);

	result.body = body;

	callback(null, result);
};

// Parse files (images, etc)
Parser.prototype.files = function(url, body, callback) {
	var result = helpers.cloneObject(this.defaultResult);

	result.body = body;

	callback(null, result);
};

module.exports = Parser;