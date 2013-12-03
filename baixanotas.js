var spawn = require('child_process').spawn;
var readline = require('readline');

/**
 * Chama o programa que gera o XML com as notas.
 *
 * @param {String} dataInicial
 * @param {String} dataFinal
 * @param {String} empresa
 * @param {String} servico
 * @param {Function} callback
 * @param {Function} endCallback
 *
 */
exports.baixar = function (dataInicial, dataFinal, empresa, servico, callback, endCallback) {
    var filename = (new Date()).getTime();

    // passando os parametros por variaveis de ambiente
    process.env.NOME_EMPRESA = empresa;
    process.env.NOME_SERVICO = servico;

    var child = spawn('./geraxml.py', [filename, dataInicial, dataFinal]);

    var rd = readline.createInterface({
        input: child.stdout,
        output: process.stdout,
        terminal: false
    });

    // Each line received from the process is sent to the callback
    rd.on('line', callback);
    rd.on('close', function() {
        endCallback(filename);
    });
}

/**
 * Método apenas para testes
 *
 */
exports.baixarMock = function (dataInicial, dataFinal, callback, endCallback) {
    var filename = (new Date()).getTime();
    var contador = 0;
    var intID;
    var lista = ['item1', 'item2', 'item3', 'item4', 'item5'];

    intID = setInterval(function () {
        if (contador === 5) {
            clearInterval(intID);
            endCallback();
            return;
        }
        callback(lista[contador]);
        contador += 1;
    }, 1000);
}
