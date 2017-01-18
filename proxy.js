#!/usr/bin/env node
// Inspired by https://github.com/clintandrewhall/node-jsonp-proxy

'use strict';

var sys = require("util"), http = require("http"),
    url = require("url"), https = require('https');

var argv = optimist();
console.log(argv.p) ;
console.log(argv.u) ;
console.log(argv.c) ;

http.createServer(function(req, res) {
    // read the config file and/or commmand line parameters
    var from_uri = url.parse(req.url, true);
    var to_uri = url.parse(argv.u, true);

    var protocol = http;

    var options = {
        path: from_uri.path,
        port: to_uri.port,
        method: "GET",
        hostname : to_uri.hostname,
        headers: {
            'Accept' : 'application/sparql-results+json'
        }
    };

    var r = protocol.request(options);

    r.addListener('response', function(response) {
        var body = '';

        response.setEncoding("utf8");

        response.addListener("data", function(chunk) {
            body += chunk;
        });

        response.addListener('end', function() {
            wrap(body);
        });
    });

    r.end();



    function wrap(contents) {

        res.write(argv.c + '(' + contents + ')');
        return res.end() ;
    }


}).listen(argv.p);

function optimist() {
    var usage = [
        'Simple proxy to wrap json responses in a callback',
        '',
        '',
        'Usage:',
        '  json-proxy [-u uri] [-p port] [-c callback]',
        '',
        'Examples:',
        '   proxy -p 8080 -u "http://server:9900 -c "callb_" ',
        ''
    ].join('\n');

    var argv = require('optimist')
        .usage(usage)
        .alias('p', 'port')
        .describe('p', 'The TCP port to run on')
        .alias('u', 'uri')
        .describe('g', 'URL for a LAN HTTP proxy to use for forwarding requests')
        .alias('c', 'callback')
        .describe('c', 'The callback to wrap the response in, e.g. "callback" ')
        .describe('html5mode', 'support AngularJS HTML5 mode by catching 404s')
        .alias('?', 'help')
        .argv;

    if (argv.help === true) {
        require('optimist').showHelp();
        process.exit(-1);
    }

    return argv;
}