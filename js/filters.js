app.filter('formatadata', function () {
    return function (data) {
        return data.substr(8,2) + '/' + data.substr(5, 2) + '/' + data.substr(0,4)
    }
});

app.filter('formatavalor', function () {
    return function (valor) {
        var valores = valor.toString().split('.');
        var centavos = (valores[1]+"0").substr(0, 2);
        return 'R$ ' + Array(valores[0], centavos).join(',');
    }
});


