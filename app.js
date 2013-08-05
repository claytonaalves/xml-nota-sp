// TODO: testar no centos
var express = require('express');
var moment = require('./moment.js');
var mysql = require('mysql');
var baixarNotas = require('./baixanotas.js').baixar;
var app = express();
var connection = mysql.createConnection('mysql://admmysql:1234@localhost/vigo');

connection.connect();

app.use(express.logger());
app.use(express.favicon(__dirname + '/img/favicon.ico'));
app.use('/static', express.static(__dirname + '/public'));
app.use('/css', express.static(__dirname + '/css'));
app.use('/js', express.static(__dirname + '/js'));
app.use('/img', express.static(__dirname + '/img'));


var auth = express.basicAuth(function(user, password, fn) {
    // console.log('--> Checking credentials');
    connection.query('select login, senha from operadores where login=? and senha=?', [user, password], function(err, rows, fields) {
        var result = !(rows.length===0);
        // console.log('---> Credentials result', result);
        fn(null, result);
    });
});


app.get('/', auth, function (req, res) {
    res.sendfile('views/index.html');
});


app.get('/notas', function (req, res) {
    var data1, data2, sql, q = req.query;

    data1 = moment(q.dataInicial, "DD/MM/YYYY").format("YYYY-MM-DD");
    data2 = moment(q.dataFinal, "DD/MM/YYYY").format("YYYY-MM-DD");

    sql = "SELECT DISTINCT " +
          "nf.numero, " +
          "dt_emissao as emissao, " +
          "nf.nome, " +
          "nf.valor_servicos as valor " +
          "FROM nf " +
          "LEFT JOIN usuarios_unicos us on (nf.nome=us.nome AND nf.cpfcnpj=us.cpfcgc) " +
          "WHERE dt_emissao BETWEEN '" + data1 + "' AND '" + data2 + "' ";

    connection.query(sql, function (err, rows, fields) {
        if (err) throw err;
        res.send(rows);
        //connection.end();
    })
});


app.get('/xml/gerar', function(req, res)  {
    var data1, data2, q = req.query;

    data1 = moment(q.dataInicial, "DD/MM/YYYY").format("YYYY-MM-DD");
    data2 = moment(q.dataFinal, "DD/MM/YYYY").format("YYYY-MM-DD");

    req.socket.setTimeout(Infinity);
 
    res.writeHead(200, {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive'
    });
    res.write('\n');
 
    baixarNotas(data1, data2, function (linha) {
        var d = new Date();
        // console.log('--> ', linha);
        res.write('id: ' + d.getMilliseconds() + '\n');
        res.write('data:' + linha +   '\n\n');
    }, function (filename) {
        var d = new Date();
        // console.log('--> Enviando evento END!');
        res.write('id: ' + d.getMilliseconds() + '\n');
        res.write('event: end\n');
        res.write('data: ' + filename + '.xml\n\n');
    });
});


app.get('/xml/baixar/:arquivo', function (req, res) {
    res.download(req.params.arquivo);
});


//app.listen(8000, '10.1.1.42');
app.listen(8000);

