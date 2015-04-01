var express = require('express');
var moment = require('./lib/moment.js');
var notas = require('./lib/baixanotas.js');
var database = require('./lib/database.js');
var config = require('./config.js');
var db = require('./dbconfig.js');
var app = express();

var nodeUserGid = "node";
var nodeUserUid = "node";
var port = 8010;

database.configure(db.host, db.username, db.password, db.database);

//process.chdir('/var/www/app');

app.use(express.bodyParser());
app.use(express.logger());
app.use(express.favicon(__dirname + '/www/img/favicon.ico'));
app.use('/static', express.static(__dirname + '/www/public'));
app.use('/css', express.static(__dirname + '/www/css'));
app.use('/js', express.static(__dirname + '/www/js'));
app.use('/img', express.static(__dirname + '/www/img'));

var auth = express.basicAuth(database.autentica);

app.get('/', auth, function (req, res) {
    res.sendfile('www/views/index.html');
});

app.get('/views/:arquivo', function (req, res) {
    res.sendfile('www/views/' + req.params.arquivo);
});

app.get('/empresas', function (req, res) {
    database.empresas(function(rows) {
        res.send(rows);
    });
});

app.get('/funcionarios', function (req, res) {
    database.funcionarios(function(rows) {
        res.send(rows);
    });
});

app.get('/notas', function (req, res) {
    var q = req.query;
    var data1 = moment(q.dataInicial, "DD/MM/YYYY").format("YYYY-MM-DD");
    var data2 = moment(q.dataFinal, "DD/MM/YYYY").format("YYYY-MM-DD");

    database.notas(data1, data2, q.empresa, q.servico, function (err, rows) {
        if (err) throw err;
        res.send(rows);
    });
});

// Usado por um EventSource
app.get('/xml/gerar', function(req, res)  {
    var q = req.query;

    req.socket.setTimeout(Infinity);
 
    res.writeHead(200, {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive'
    });
    res.write('\n');

    notas.gerar(q.numeros, function (linha) {
        var d = new Date();
        res.write('id: ' + d.getMilliseconds() + '\n');
        res.write('data:' + linha +   '\n\n');
    }, function (filename) {
        var d = new Date();
        // Enviando evento END
        res.write('id: ' + d.getMilliseconds() + '\n');
        res.write('event: end\n');
        res.write('data: ' + filename + '\n\n');
    });
});

app.get('/xml/baixar/:arquivo', function (req, res) {
    res.download('notas/'+req.params.arquivo);
});

app.get('/config', function (req, res) {
    res.send(config.get());
});

app.post('/config', function (req, res) {
    config.set(req.body);
    res.send('ok');
});

app.listen(port /* , function() {
	process.setgid(nodeUserGid);
	process.setuid(nodeUserUid);
} */ );

console.log('Servidor iniciado... http://localhost:'+port+'/');

