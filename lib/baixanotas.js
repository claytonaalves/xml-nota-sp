var spawn = require('child_process').spawn;
var readline = require('readline');

/**
 * Chama o programa que gera o XML com as notas.
 */
exports.gerar = function (numero_dos_titulos, callback, endCallback) {
    var filename = (new Date()).getTime()+'.xml';

    // passando os parametros por variaveis de ambiente
    process.env.TITULOS = numero_dos_titulos;

    var child = spawn('scripts/geraxml.py', ['notas/'+filename]);

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
exports.gerarMock = function (numero_dos_titulos, callback, endCallback) {
    //var filename = (new Date()).getTime();
    var filename = '1414789860033';
    var contador = 0;
    var intID;
    var lista = ['1 fulano', '2 ciclano', '3 beltrano', '3 beltrano', '3 beltrano', '3 beltrano', '3 beltrano', '3 beltrano', '3 beltrano', '3 beltrano'];

    intID = setInterval(function () {
        if (contador>lista.length) {
            clearInterval(intID);
            endCallback(filename);
            return;
        }
        callback(lista[contador]);
        contador += 1;
    }, 1000);
}
