var spawn = require('child_process').spawn;
var readline = require('readline');

// TODO: Gerar o nome do mês automaticamente

var meses = ['janeiro', 'fevereiro', 'março', 'abril', 'maio', 'junho', 'julho', 'agosto', 'setembro', 'outubro', 'novembro', 'dezembro'];

/**
 * Description
 *
 * @param {Date} dataInicial description
 *
 */
exports.baixar = function (dataInicial, dataFinal, callback, endCallback) {
    var child = spawn('./geraxml.py', ['julho', dataInicial, dataFinal]); // TODO: falta corrigir o mês que está fixo

    var rd = readline.createInterface({
        input: child.stdout,
        output: process.stdout,
        terminal: false
    });

    // Each line received from the process is sent to the callback
    rd.on('line', function(line) {
        callback(line);
    });

    rd.on('close', function() {
        console.log('--> Finalizando processo!');
        // TODO: enviar o nome do mês por aqui
        endCallback();
    });
}

/**
 * Método apenas para testes
 *
 */
exports.baixarMock = function (dataInicial, dataFinal, callback, endCallback) {
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
