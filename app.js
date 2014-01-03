var express = require('express');
var moment = require('./moment.js');
var baixarNotas = require('./baixanotas.js').baixar;
var database = require('./database.js');
var config = require('./config.js');
var app = express();

var nodeUserGid = "node";
var nodeUserUid = "node";

process.chdir('/var/www/app');

app.use(express.bodyParser());
app.use(express.logger());
app.use(express.favicon(__dirname + '/img/favicon.ico'));
app.use('/static', express.static(__dirname + '/public'));
app.use('/css', express.static(__dirname + '/css'));
app.use('/js', express.static(__dirname + '/js'));
app.use('/img', express.static(__dirname + '/img'));

var auth = express.basicAuth(database.autentica);

app.get('/', auth, function (req, res) {
    res.sendfile('views/index.html');
});

app.get('/views/:arquivo', function (req, res) {
    res.sendfile('views/' + req.params.arquivo);
});


app.get('/notas', function (req, res) {
    var data1, data2, q = req.query;

    data1 = moment(q.dataInicial, "DD/MM/YYYY").format("YYYY-MM-DD");
    data2 = moment(q.dataFinal, "DD/MM/YYYY").format("YYYY-MM-DD");

    database.notas(data1, data2, q.empresa, q.servico, function (err, rows, fields) {
        if (err) throw err;
        res.send(rows);
    });
});


app.get('/empresas', function (req, res) {
    database.empresas(function(rows) {
        res.send(rows);
    });
});


app.get('/servicos', function (req, res) {
    database.servicos(function(rows) {
        res.send(rows);
    });
});


// Usado por um EventSource
app.get('/xml/gerar', function(req, res)  {
    var data1, data2, empresa, servico, q = req.query;

    empresa = unescape(q.empresa);
    servico = unescape(q.servico);
    data1 = moment(q.dataInicial, "DD/MM/YYYY").format("YYYY-MM-DD");
    data2 = moment(q.dataFinal, "DD/MM/YYYY").format("YYYY-MM-DD");

    req.socket.setTimeout(Infinity);
 
    res.writeHead(200, {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive'
    });
    res.write('\n');
 
    baixarNotas(data1, data2, empresa, servico, function (linha) {
        var d = new Date();
        res.write('id: ' + d.getMilliseconds() + '\n');
        res.write('data:' + linha +   '\n\n');
    }, function (filename) {
        var d = new Date();
        // Enviando evento END
        res.write('id: ' + d.getMilliseconds() + '\n');
        res.write('event: end\n');
        res.write('data: ' + filename + '.xml\n\n');
    });
});


app.get('/xml/baixar/:arquivo', function (req, res) {
    res.download(req.params.arquivo);
});

app.get('/config', function (req, res) {
    res.send(config.get());
});

app.post('/config', function (req, res) {
    config.set(req.body);
    res.send('ok');
});

app.listen(8000, function() {
	process.setgid(nodeUserGid);
	process.setuid(nodeUserUid);
});

