var express = require('express'),
    app = express(),
    moment = require('./moment.js'),
    baixarNotas = require('./baixanotas.js').baixar;
    mysql = require('mysql');

var connection = mysql.createConnection({
    host: 'localhost',
    user: 'admmysql',
    password: '1234',
    database: 'vigo'
});

connection.connect();

app.use(express.logger());
app.use(express.favicon(__dirname + '/img/favicon.ico'));
app.use('/static', express.static(__dirname + '/public'));
app.use('/css', express.static(__dirname + '/css'));
app.use('/js', express.static(__dirname + '/js'));
app.use('/img', express.static(__dirname + '/img'));

app.get('/', function (req, res) {
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
          "WHERE dt_emissao BETWEEN '" + data1 + "' AND '" + data2 + "' "
          // "LIMIT 25 "

    //console.log(req.headers);

   //res.setHeader('Content-Type', 'text/plain');
   //res.setHeader('Content-Length', body.length);

    connection.query(sql, function (err, rows, fields) {
        console.log('-->', rows.length);
        if (err) throw err;
        res.send(rows);
        //connection.end();
    })
});

app.get('/notas.xml', function(req, res)  {
    var data1, data2, q = req.query;

    data1 = moment(q.dataInicial, "DD/MM/YYYY").format("YYYY-MM-DD");
    data2 = moment(q.dataFinal, "DD/MM/YYYY").format("YYYY-MM-DD");

    // set timeout as high as possible
    req.socket.setTimeout(Infinity);
 
    // send headers for event-stream connection
    // see spec for more information
    res.writeHead(200, {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive'
    });
    res.write('\n');
 
    baixarNotas(data1, data2, function (linha) {
        var d = new Date();
        //console.log('--> ', linha);
        res.write('id: ' + d.getMilliseconds() + '\n');
        res.write('data:' + linha +   '\n\n'); // Note the extra newline
    })
});

app.listen(8000);

