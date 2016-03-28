var parse = require('./parse');

var interviews = [];

parse.parseDir(__dirname + '/data').then(function(interviews){
    console.log(interviews.length, interviews[0].questions.length);
})
