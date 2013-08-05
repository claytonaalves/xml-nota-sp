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

app.controller('NotasCtrl', function ($scope, $http, notas, $rootScope) {
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
                $rootScope.totalNotas = notas.length;
                $scope.loading = false;
            });
    };

    $scope.baixaXML = function () {
        $rootScope.baixando = true;
        var sse = new EventSource('xml/gerar?dataInicial='+$scope.dataInicial+'&dataFinal='+$scope.dataFinal);

        sse.addEventListener('message', function(msg) {
            if (!msg) {
                console.log
                sse.close();
            }
            else {
                $rootScope.$broadcast('progress', msg.data);
            }
        });

        sse.addEventListener('end', function (msg) {
            //console.log('arquivo gerado!', msg.data);
            $rootScope.baixando = false;
            sse.close();
            // iniciar download do arquivo aqui
            $scope.$apply(function() {
                $scope.notafiscal = 'xml/baixar/'+msg.data;
            });
        });
    }

});

app.controller('BaixandoCtrl', function ($scope, $rootScope) {
    $scope.nome = 'Iniciando a geração do arquivo XML...';
    $scope.progresso = 0;
    var contador = 0;
    $rootScope.$on('progress', function (e, nome) {
        $scope.$apply(function() {
            $scope.nome = nome;   
            $scope.progresso = Math.round((contador*100)/$rootScope.totalNotas);
            contador += 1;
        })
    });
});

app.directive('focus', function() {
    return {
        link: function(scope, element, attrs) {
            element[0].focus();
        }
    }
});
