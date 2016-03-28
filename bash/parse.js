var Promise = require('bluebird');
var fs = Promise.promisifyAll(require('fs'));
var _ = require('lodash');
var Q = require('q');

function parseLine(l, interview, interviews) {
    var line = l.trim();
    if (line.startsWith('---')) {
        //TODO, add previous interview info to interviews list
        if (!!interview.Client) interviews.push(interview); //have client parse success, push previous intervew to interviews
        return {};
    }

    //If is header
    var isHeader = false;
    ['Client', 'Candidate', 'Date', 'Type'].forEach(function(k) {
        if (line.startsWith(k)) {
            interview[k] = line.split(':')[1].trim();
            isHeader = true;
        }
    });

    // intervew list add to intervew questions 
    if (!isHeader) {
        var matchRes = /^\d+\.\s*(.*)/.exec(line.trim());
        if (!!matchRes) {
            if (!interview.questions) interview.questions = [];
            interview.questions.push(matchRes[1]);
        }
    }
    return interview;
}

function parseFile(file) {
    console.log('parse file', file);
    var interviews = [];

    return fs.readFileAsync(file, 'utf8').then(function(cnt) {
        var lines = cnt.split('\n');
        var interview = {};
        lines.forEach(function(l) {
            interview = parseLine(l, interview, interviews);
        });
        if (!!interview.Client) interviews.push(interview);
        console.log(interviews.length);
        return interviews;
    });
}

function parseDir(dir) {
    return fs.readdirAsync(dir).then(function(files) {
        var promise = Q();
        var results = [];
        _.map(files, function(file) {
            var filePath = dir + '/' + file;
            var fsStat = fs.statSync(filePath);
            if (fsStat.isDirectory())
                promise = promise.then(function() {
                    return parseDir(filePath).then(function(its) {
                        return results.concat(its);
                    });
                })
            else if (fsStat.isFile() && file.endsWith('.txt'))
                promise = promise.then(function() {
                    return parseFile(filePath).then(function(its) {
                        results = results.concat(its);
                        return results;
                    });
                })
            else console.log('ignore', filePath);
        });
        return promise;
    });
}

module.exports = {
    parseFile: parseFile,
    parseDir: parseDir
}
