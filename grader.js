#!/usr/bin/env node
/*
Automatically grade files for the presence of specified HTML tags/attributes.
Uses commander.js and cheerio. Teaches command line application development
and basic DOM parsing.

References:

 + cheerio
   - https://github.com/MatthewMueller/cheerio
   - http://encosia.com/cheerio-faster-windows-friendly-alternative-jsdom/
   - http://maxogden.com/scraping-with-node.html

 + commander.js
   - https://github.com/visionmedia/commander.js
   - http://tjholowaychuk.com/post/9103188408/commander-js-nodejs-command-line-interfaces-made-easy

 + JSON
   - http://en.wikipedia.org/wiki/JSON
   - https://developer.mozilla.org/en-US/docs/JSON
   - https://developer.mozilla.org/en-US/docs/JSON#JSON_in_Firefox_2
*/

var util = require('util');
var fs = require('fs');
var program = require('commander');
var cheerio = require('cheerio');
var rest = require('restler');

var HTMLFILE_DEFAULT = "index.html";
var CHECKSFILE_DEFAULT = "checks.json";
var URL_DEFAULT = "http://arcane-brushlands-4998.herokupp.com";

var assertFileExists = function(infile) {
    var instr = infile.toString();
    if(!fs.existsSync(instr)) {
        console.log("%s does not exist. Exiting.", instr);
        process.exit(1); // http://nodejs.org/api/process.html#process_process_exit_code
    }
    console.log("Infile: " + instr);
    return instr;
};

var cheerioHtmlFile = function(htmlfile) {
    var data = fs.readFileSync(htmlfile);
    console.log('cheerioHtmlFile: ' + data);
    return cheerio.load(data);
    //return cheerio.load(fs.readFileSync(htmlfile));
};

var loadChecks = function(checksfile) {
    var data = fs.readFileSync(checksfile);
    console.log('Load Check: ' + data)
    return JSON.parse(data);
    //return JSON.parse(fs.readFileSync(checksfile));
};

var checkHtmlFile = function(htmlfile, checksfile) {
    $ = cheerioHtmlFile(htmlfile);
    var checks = loadChecks(checksfile).sort();

    console.log('checkHtmlFie: + ', checks);
     
    console.log('checkHtmlFie: + ', $);
    var out = {};
    for(var ii in checks) {
        var present = $(checks[ii]).length > 0;
        out[checks[ii]] = present;
    }
    return out;
};

var checkUrl = function(url, checksfile) {
    console.log('check URL: ' + url);
    rest.get(url).on('complete', function(result) {
        if (result instanceof Error) {
	     util.puts('Error: ' + result.message);
	     this.retry(5000);		// try again in 5 sec
	} else {
	     //util.puts(result);
	     //var buf = new Buffer(JSON.parse(result));
	     //var buf = JSON.parse(result);
	     $ = cheerio.load(result);
	    
 
	     //var checks = rcheck.toString();
             var checks = loadChecks(checksfile).sort();
	     var out = {};
    	     for(var ii in checks) {
                  var present = $(checks[ii]).length > 0;
                  out[checks[ii]] = present;
             }

		
	console.log('TRUE');
        //console.log('Printing ... ' + buf);
    	//var checkJson = buf.toString();
    	var checkJson = out;
       console.log('Printing ... ' );
    	var outJson = JSON.stringify(checkJson, null, 4);
    	console.log(outJson);
	     return result[0].message;
	}
    });
};

var clone = function(fn) {
    // Workaround for commander.js issue.
    // http://stackoverflow.com/a/6772648
    return fn.bind({});
};

if(require.main == module) {
    program
        .option('-f, --file <html_file>', 'Path to index.html', clone(assertFileExists), HTMLFILE_DEFAULT)
        .option('-c, --checks <check_file>', 'Path to checks.json', clone(assertFileExists), CHECKSFILE_DEFAULT)
        .option('-u, --url <url>', 'Path to url') //, clone(checkUrl), URL_DEFAULT)
        .parse(process.argv);
    console.log('PRG: ' + program);
    console.log('FILE: ' + program.file);
    console.log('CHECK: ' + program.checks);
    console.log('URL: ' + program.url);
    if (program.url == null) {
        var checkJson = checkHtmlFile(program.file, program.checks); 
        var outJson = JSON.stringify(checkJson, null, 4);
        console.log(outJson);
    } else {
         var checkJson = checkUrl(program.url, program.checks); 
         console.log('CHKSON: ' + checkJson); 
    }
    //console.log('CHKSON1: ' + checkJson1);
    //var outJson = JSON.stringify(checkJson, null, 4);
    //console.log(outJson);
} else {
    exports.checkHtmlFile = checkHtmlFile;
}
