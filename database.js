var mysql = require('mysql');
var connection = mysql.createConnection('mysql://admmysql:1234@localhost/vigo');
//var connection = mysql.createConnection('mysql://root:@localhost/vigo');

connection.connect();

exports.autentica = function(user, password, callback) {
    connection.query('select login, senha from operadores where login=? and senha=?', [user, password], function(err, rows, fields) {
        // Se o numero de rows nao for igual a zero (significa que o registro foi encontrado)
        var result = !(rows.length===0);
        callback(null, result);
    });
}

// Alguns clientes podem ter o mesmo nome e CNPJ, então a View "usuarios_unicos"
// serve para eliminar as duplicidades.
exports.notas = function(dataInicial, dataFinal, empresa, servico, callback) {
    var sql =  "SELECT DISTINCT                                                            " +
               "   nf.numero,                                                              " +
               "   dt_emissao as emissao,                                                  " +
               "   nf.nome,                                                                " +
               "   nf.valor_servicos as valor                                              " +
               "FROM nf                                                                    " +
               "LEFT JOIN usuarios_unicos us on (nf.nome=us.nome AND nf.cpfcnpj=us.cpfcgc) " +
               "LEFT JOIN empresas emp ON nf.idempresa=emp.id                              " +
               "WHERE (dt_emissao BETWEEN '" + dataInicial + "' AND '" + dataFinal + "')   " +
               "   AND emp.fantasia='" + empresa + "'" +
               "   AND nf.natureza='" + servico + "'";

    connection.query(sql, callback);
}

exports.empresas = function (callback) {
    var sql = "select id, fantasia from empresas";

    connection.query(sql, function (err, rows, fields) {
        callback(rows);
    });
}

exports.servicos = function (callback) {
    var sql = "select distinct natureza from nf";
    connection.query(sql, function (err, rows, fields) {
        callback(rows);
    });
}
