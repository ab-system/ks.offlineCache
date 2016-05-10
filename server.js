var express = require('express');

var app = express();
var port = 8080;

process.on('uncaughtException', function(err) {
    // handle the error safely
    console.log(err)
})


app.all('/*', function(req, res, next) {
    console.log(req.url);
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Content-Type, Access-Control-Allow-Headers, Authorization, X-Requested-With");
    res.header("Access-Control-Allow-Methods", "GET,POST,PUT,DELETE,OPTIONS");
    res.json(new Date());
});

app.listen(port);

console.log("App listening on port " + port);
