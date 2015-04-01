var mysql = require('mysql');
var util = require('util');
var crypt = require('./criptografia.js');

var connection;

/*
 * Configura a conexão com o banco de dados
 */
function configure (host, username, password, database) {
    connection = mysql.createConnection(util.format('mysql://%s:%s@%s/%s', username, password, host, database));
    connection.connect();
}

/*
 * Retorna true caso as credenciais estejam corretas
 */
function autentica (user, password, callback) {
    var encrypted_password = crypt.encrypt(password);
    var query_text = 'select login, senha from sistema_operadores where login=? and senha=?';
    connection.query(query_text, [user, encrypted_password], function(err, rows, fields) {
        var result = !(rows.length===0);
        callback(null, result);
    });
}

/*
 * Retorna uma lista de títulos
 */
function titulos (dataInicial, dataFinal, empresa, servico, callback) {
    var sql =  "SELECT id, emissao, nossonumero, nome, cpfcgc, valor             " +
               "FROM financeiro_boletos                                          " +
               "WHERE                                                            " +
               "   vencimento BETWEEN '" + dataInicial + "' AND '" + dataFinal + "' " +
               "   AND id_empresa='" + empresa + "'                              " +
               "";
               //"LIMIT 10";

    connection.query(sql, callback);
}

/*
 * Retorna a lista de empresas cadastradas
 */
function empresas (callback) {
    var sql = "select id, fantasia from sistema_empresas";
    connection.query(sql, function (err, rows, fields) {
        callback(rows);
    });
}

/*
 * Retorna lista de vendedores
 */
function funcionarios (callback) {
    var sql = "select id, nome from cadastro_funcionarios";
    connection.query(sql, function (err, rows, fields) {
        console.log(err);
        callback(rows);
    });
}

exports.configure = configure;
exports.autentica = autentica;
exports.notas = titulos;
exports.empresas = empresas;
exports.funcionarios = funcionarios;
