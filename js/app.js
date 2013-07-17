var app = angular.module("appNota", []);

app.directive('dateformat', function () {
    return {
        restrict: 'A',
        link: function (scope, element, attrs) {
            element.bind('blur', function () {
                var model = attrs['ngModel'];
                scope[model] = DataValida(scope[model]);
                scope.$apply();
            });
        }
    };
});

app.factory('notas', ['$http', '$q', function ($http, $q) {
    var carregaNotas = function(inicio, fim) {
        var deferred = $q.defer();
        $http({url: '/notas', method: 'get', params: {dataInicial: inicio, dataFinal: fim} })
            .success(function (data, rstatus, headers, config) {
                deferred.resolve(data);
            });
        return deferred.promise;
    }
    return {
        carregar: carregaNotas
    }
}]);

app.controller('NotasCtrl', function ($scope, $http, notas) {
    $scope.loading = false;
    $scope.dataInicial = DataValida('01');
    $scope.dataFinal = DataValida('31');
    $scope.notas = [];

    $scope.baixaNotas = function() {
        $scope.loading = true;
        $scope.notas = [];
        notas.carregar($scope.dataInicial, $scope.dataFinal)
            .then(function (notas) {
                $scope.notas = notas;    
                $scope.loading = false;
            });
    };

    $scope.baixaXML = function () {
        $scope.notafiscal = 'nota.xml';
    }
});

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

app.run(function () {
    //$scope.baixaNotas();
});


