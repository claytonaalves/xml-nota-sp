var app = angular.module("appNota", ['ngRoute']);

app.config(['$routeProvider', function ($routeProvider) {
    $routeProvider.
        when('/', {templateUrl: 'views/notas.html', controller: 'NotasCtrl'}).
        when('/config', {templateUrl: 'views/config.html', controller: 'ConfigCtrl'}).
        otherwise({redirectTo: '/'});
}]);

app.factory('Empresas', ['$http', function ($http) {
    var empresa_selecionada = '1';
    var lista;

    var getEmpresaSelecionada = function () {
        return empresa_selecionada;
    }

    var getLista = function() {
        return lista;
    }

    var carregar = function(callback) {
        $http({url: '/empresas', method: 'get'}).success(function (data) {
            lista = data;
            empresa_selecionada = data[0].id;
            callback();
        });
    }

    return {
        carregar: carregar,
        lista: getLista,
        selecionada: getEmpresaSelecionada
    }
}]);

app.factory('Titulos', ['$http', '$q', function ($http, $q) {
    var titulos = {};

    titulos.carregar = function (inicio, fim, empresa, lista) {
        var deferred = $q.defer();
        
        $http({ url: '/notas', method: 'get', params: { dataInicial: inicio, dataFinal: fim, empresa: empresa } })
            .success(function (data, rstatus, headers, config) {
                titulos.lista = data;
                titulos.quantidade = data.length;

                // soma o valor das notas
                titulos.total = 0;
                for (var i=0; i<data.length; i++) {
                    titulos.total += data[i].valor;
                    lista.push(data[i].id); // adiciona o título na lista de títulos selecionados
                }

                deferred.resolve();
            });
        return deferred.promise;
    }

    return titulos
}]);

app.factory('XmlNotas', ['$rootScope', function ($rootScope) {
    var service = {};

    service.baixar = function (titulos, callback) {
        var sse = new EventSource('xml/gerar?numeros='+titulos);

        sse.addEventListener('message', function (msg) {
            if (!msg) {
                sse.close();
            }
            else {
                $rootScope.$broadcast('progress', msg.data);
            }
        });

        // arquivo gerado
        sse.addEventListener('end', function (msg) {
            sse.close();

            // Seta o src do iframe para iniciar o download do arquivo xml
            callback(msg.data)
        });
    }

    return service;
}]);

app.controller('NotasCtrl', function ($scope, Empresas, Titulos, XmlNotas, $rootScope) {
    $scope.loading = false;
    $scope.dataInicial = DataValida('01');
    $scope.dataFinal = DataValida('31');
    $scope.titulos_selecionados = [];
    $scope.titulos = Titulos;    

    /* Baixa a lista de empresas para preencher o combobox */
    Empresas.carregar(function () {
        $scope.empresas = Empresas.lista();
        $scope.empresa_id = Empresas.selecionada();
        $scope.listarTitulos();
    });

    /* Baixa a lista de títulos para preencher a grade */
    $scope.listarTitulos = function () {
        $scope.titulos_selecionados = [];
        $scope.loading = true;
        Titulos.carregar($scope.dataInicial, $scope.dataFinal, $scope.empresa_id, $scope.titulos_selecionados)
            .then(function () {
                $scope.loading = false;
            });
    };

    /* Envia o comando para iniciar a geração do XML */
    $scope.baixaXML = function () {
        $rootScope.baixando = true;
        XmlNotas.baixar($scope.titulos_selecionados, function (nome_arquivo) {
            $scope.$apply(function () {
                $scope.notafiscal = 'xml/baixar/'+nome_arquivo;
                $rootScope.baixando = false;
            });
        });
    }

    // adiciona ou remove um título selecionado a lista de títulos selecionados
    $scope.toggleSelection = function toggleSelection(numero) {
        var idx = $scope.titulos_selecionados.indexOf(numero);
        if (idx > -1) {
          $scope.titulos_selecionados.splice(idx, 1);
        }
        else {
          $scope.titulos_selecionados.push(numero);
        }
    };
});

app.controller('BaixandoCtrl', function ($scope, $rootScope, Titulos) {
    $scope.nome = 'Iniciando a geração do arquivo XML...';
    $scope.progresso = 0;
    var contador = 0;
    $rootScope.$on('progress', function (e, nome) {
        $scope.$apply(function() {
            $scope.nome = nome;   
            $scope.progresso = Math.round((contador*100)/Titulos.quantidade);
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
            $scope.ultimo_rps = data.ultimo_rps;
        });

    $scope.enviar = function() {
        var configuracoes = {
            discriminacao : $scope.discriminacao,
            inss          : parseFloat($scope.inss),
            deducoes      : parseFloat($scope.deducoes),
            irrf          : parseFloat($scope.irrf),
            estado        : $scope.estado,
            observacoes   : $scope.observacoes,
            codigo        : $scope.codigo,
            ultimo_rps    : $scope.ultimo_rps
        }
        $http({url: '/config', method: 'post', data: configuracoes})
            .success(function (data, rstatus, headers, config) {
                $location.path('/');
            });
    }
    
});

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

app.directive('focus', function() {
    return {
        link: function(scope, element, attrs) {
            element[0].focus();
        }
    }
});
