var resolveUrl = require('url').resolve;

var helpers = {
    extend: function(target) {
        var sources = [].slice.call(arguments, 1);
        sources.forEach(function (source) {
            for (var prop in source) {
                target[prop] = source[prop];
            }
        });
        return target;
    },

    cloneObject: function(obj) {
        return JSON.parse(JSON.stringify(obj));
    },

    // Parse an URL and return a filename for it
    urlToFilename: function(url) {
        var name = (url.lastIndexOf('/')+1 < url.length) ? url.substring(url.lastIndexOf('/')+1) : 'index.html';

        return name;
    },

    getDomain: function(url) {
        return url.match(/^https?\:\/\/([^\/?#]+)(?:[\/?#]|$)/i)[1];
    },

    normalizeUrl: function(base, url) {
        if(url.match(/((ftp|http|https):\/\/){1}/) === null) {
            url = resolveUrl(base, url);
        }

        return url;
    }
};

module.exports = helpers;