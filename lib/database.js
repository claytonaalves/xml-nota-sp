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
 * Retorna um objeto com um método para listar os títulos de acordo com os
 * parâmetros inforados
 */
function Titulos () {
    var sql = "SELECT b.id, b.emissao, b.nossonumero, b.nome, b.cpfcgc, b.valor, b.vencimento                       " +
              "FROM   financeiro_boletos b, cadastro_clientes c                                                     " +
              "WHERE                                                                                                " +
              "    (b.id_cliente=c.id)                                                                              " +
              "    AND (b.ativo='S')                                                                                " +
              "    AND (                                                                                            " +
              "            (b.id_empresa=9999 or b.id_empresa=%d)                                                   " +
              "            AND (b.pago IN (%s))                                                                     " +
              "            AND (b.pago_data>='%s' AND b.pago_data<='%s')                                            " +
              "            AND (c.vendedor LIKE '%%%d - %%')                                                        " +
              "            AND ((c.situacao = 'L' OR c.situacao IS NULL OR c.situacao = '') OR (c.situacao = 'B'))) " +
              "ORDER BY b.nome, b.vencimento                                                                        ";

    this._formata_pagamento = function (pagamento) {
        if (pagamento === 'pagos') {
            return "'1'";
        } else if (this.pagamento === 'naopagos') {
            return "'0'";
        } else if (this.pagamento === 'todos') {
            return "'0', '1'";
        }
    }

    this.listar = function (callback) {
        var pagamento = this._formata_pagamento(this.pagamento);
        var query = util.format(sql, this.empresa_id, pagamento, this.dataInicial, this.dataFinal,
                                this.vendedor_id);
        connection.query(query, callback);
    }
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
exports.empresas = empresas;
exports.funcionarios = funcionarios;
exports.Titulos = Titulos;
