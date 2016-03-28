var Promise = require('bluebird');
var fs = Promise.promisifyAll(require('fs'));
var _ = require('lodash');

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
        var promises = _.map(files, function(file) {
            var results = [];
            var filePath = dir + '/' + file;
            var fsStat = fs.statSync(filePath);
            if (fsStat.isDirectory()) results = parseDir(filePath);
            else if (fsStat.isFile() && file.endsWith('.txt'))
                results = parseFile(filePath);
            else console.log('ignore', filePath);
            return results;
        });
        return Promise.all(promises).then(function(interviewses) {
            console.log(interviewses.length);
            return _.reduce(interviewses, function(result, interviews) {
                return result.concat(interviews);
            }, []);
        });
    });
}

module.exports = {
    parseFile: parseFile,
    parseDir: parseDir
}
