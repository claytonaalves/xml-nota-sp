var spawn = require('child_process').spawn,
    readline = require('readline');

exports.baixar = function (dataInicial, dataFinal, callback) {
    var child = spawn('./geraxml.py', ['julho', '2013-07-01', '2013-07-31']); 

    //child.stdout.on('data', function(data) {
    //    console.log('-->', data.toString()); 
    //});

    //child.stderr.on('data', function (data) {
    //  console.log('stderr: ' + data);
    //});

    var rd = readline.createInterface({
        input: child.stdout,
        output: process.stdout,
        terminal: false
    });

    rd.on('line', function(line) {
        //console.log('-->', line);
        callback(line);
    });

    //rd.on('pause', function() {
    //    console.log('pause');
    //});

    //rd.on('resume', function() {
    //    console.log('resume');
    //});

    //rd.on('close', function() {
    //    console.log('close');
    //});
}

