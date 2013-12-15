var app = angular.module("appNota", []);

app.config(['$routeProvider', function($routeProvider) {
    $routeProvider.
        when('/', {templateUrl: 'views/notas.html', controller: 'NotasCtrl'}).
        when('/config', {templateUrl: 'views/config.html', controller: 'ConfigCtrl'}).
        otherwise({redirectTo: '/'});
}]);

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
    var carregaNotas = function(inicio, fim, empresa, servico) {
        var deferred = $q.defer();
        
        $http({url: '/notas', method: 'get', params: {dataInicial: inicio, dataFinal: fim, empresa: empresa, servico: servico} })
            .success(function (data, rstatus, headers, config) {
                deferred.resolve(data);
            });
        return deferred.promise;
    }
    return {
        carregar: carregaNotas
    }
}]);

app.controller('NotasCtrl', function ($scope, $http, notas, $rootScope, $timeout) {
    $scope.loading = false;
    $scope.dataInicial = DataValida('01');
    $scope.dataFinal = DataValida('31');
    $scope.notas = [];

    $http({url: '/empresas', method: 'get'})
        .success(function (data, rstatus, headers, config) {
            $scope.empresas = data;
            $scope.empresa = data[0];
            $scope.baixaNotas();
        });

    $http({url: '/servicos', method: 'get'})
        .success(function (data, rstatus, headers, config) {
            $scope.servicos = data;
            $scope.servico = data[0];
            $scope.baixaNotas();
        });

    $scope.baixaNotas = function() {
        // Só baixa as notas quando as empresas e serviços tiverem sido carregados
        if ($scope.empresas && $scope.servicos) {
            $scope.loading = true;
            $scope.notas = [];
            $scope.empresa;
            notas.carregar($scope.dataInicial, $scope.dataFinal, $scope.empresa.fantasia, $scope.servico.natureza)
                .then(function (notas) {
                    $scope.notas = notas;    
                    $rootScope.totalNotas = notas.length;
                    $scope.loading = false;
                });
        }
    };

    $scope.baixaXML = function () {
        $rootScope.baixando = true;
        var sse = new EventSource('xml/gerar?dataInicial='+$scope.dataInicial+
                                  '&dataFinal='+$scope.dataFinal+
                                  '&empresa='+escape($scope.empresa.fantasia)+
                                  '&servico='+escape($scope.servico.natureza));

        sse.addEventListener('message', function(msg) {
            if (!msg) {
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
            // Seta o src do iframe para iniciar o download do arquivo xml
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

app.controller('ConfigCtrl', function ($scope, $http, $location) {
    $http({url: '/config', method: 'get'})
        .success(function (data, rstatus, headers, config) {
            $scope.discriminacao = data.discriminacao;
            $scope.inss = data.inss.toFixed(2);
            $scope.deducoes = data.deducoes.toFixed(2);
            $scope.irrf = data.irrf.toFixed(2);
            $scope.estado = data.estado;
            $scope.codigo = data.codigo;
            $scope.observacoes = data.observacoes;
        });

    $scope.enviar = function() {
        var configuracoes = {
            discriminacao : $scope.discriminacao,
            inss          : parseFloat($scope.inss),
            deducoes      : parseFloat($scope.deducoes),
            irrf          : parseFloat($scope.irrf),
            estado        : $scope.estado,
            observacoes   : $scope.observacoes,
            codigo        : $scope.codigo
        }
        $http({url: '/config', method: 'post', data: configuracoes})
            .success(function (data, rstatus, headers, config) {
                $location.path('/');
            });
    }
    
});

app.directive('focus', function() {
    return {
        link: function(scope, element, attrs) {
            element[0].focus();
        }
    }
});
