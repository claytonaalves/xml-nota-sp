var mysql = require('mysql');
var crypt = require('./criptografia.js');

//var connection = mysql.createConnection('mysql://admmysql:1234@localhost/vigo');
var connection = mysql.createConnection('mysql://root:@localhost/vigo_erp');

connection.connect();

exports.autentica = function (user, password, callback) {
    var encrypted_password = crypt.encrypt(password);
    connection.query('select login, senha from sistema_operadores where login=? and senha=?', [user, encrypted_password], function(err, rows, fields) {
        // Se o numero de rows nao for igual a zero (significa que o registro foi encontrado)
        var result = !(rows.length===0);
        callback(null, result);
    });
}

// Alguns clientes podem ter o mesmo nome e CNPJ, então a View "usuarios_unicos"
// serve para eliminar as duplicidades.
exports.notas = function (dataInicial, dataFinal, empresa, servico, callback) {
    var sql =  "SELECT id, emissao, nossonumero, nome, cpfcgc, valor             " +
               "FROM financeiro_boletos                                          " +
               "WHERE                                                            " +
               "   emissao BETWEEN '" + dataInicial + "' AND '" + dataFinal + "' " +
               "   AND id_empresa='" + empresa + "'                              " +
               "LIMIT 10";

    connection.query(sql, callback);
}

exports.empresas = function (callback) {
    var sql = "select id, fantasia from sistema_empresas";
    connection.query(sql, function (err, rows, fields) {
        callback(rows);
    });
}

