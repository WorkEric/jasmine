var parse = require('./parse');
var db = require('./db');

parse.parseDir(__dirname + '/data')
    .then(function(interviews){
        console.log(interviews.length, interviews[0].questions.length)
        return interviews
    })
    .then(db.saveInterviews)
    .then(function() {
        return db.dbConn.then(function(db){
            return db.close();
        });
    })
    .catch(console.log);
