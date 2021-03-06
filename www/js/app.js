var app = angular.module("appNota", ['ngRoute']);

app.config(['$routeProvider', function ($routeProvider) {
    $routeProvider.
        when('/', {templateUrl: 'views/notas.html', controller: 'TitulosCtrl'}).
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

app.factory('Vendedores', ['$http', function ($http) {
    var lista;

    var getLista = function() {
        return lista;
    }

    var carregar = function(callback) {
        $http({url: '/funcionarios', method: 'get'}).success(function (data) {
            lista = data;
            callback();
        });
    }

    return {
        carregar: carregar,
        lista: getLista,
    }
}]);

app.factory('Titulos', ['$http', '$q', function ($http, $q) {
    var titulos = {};
    var selecionados = [];

    titulos.carregar = function (scope) {
        var deferred = $q.defer();
        titulos.selecionados = [];

        var params = { dataInicial : scope.dataInicial,
                       dataFinal   : scope.dataFinal,
                       empresa     : scope.empresa_id,
                       vendedor_id : scope.vendedor_id,
                       pagamento   : scope.pagamento }

        $http({ url: '/notas', method: 'get', params: params })
            .success(function (data, rstatus, headers, config) {
                titulos.lista = data;
				for (var i=0; i<data.length; i++)
					titulos.selecionados.push(data[i].id); // adiciona o título na lista de títulos selecionados
				titulos.totaliza(scope);
                deferred.resolve();
            });
        return deferred.promise;
    }

	// Totaliza os títulos selecionados
    titulos.totaliza = function (scope) {
		titulos.selecionados.total = 0;
        titulos.selecionados.quantidade = 0;
		for (var i=0; i<titulos.lista.length; i++) {
			var numero = titulos.lista[i].id;
			var idx = titulos.selecionados.indexOf(numero);
			if (idx > -1) {
				titulos.selecionados.total += titulos.lista[i].valor;
				titulos.selecionados.quantidade += 1;
			}
		}
        scope.$broadcast('totaliza');
    }

    // adiciona ou remove um título selecionado a lista de títulos selecionados
    titulos.marca_desmarca = function (scope, numero) {
        var idx = titulos.selecionados.indexOf(numero);
        if (idx > -1) {
           titulos.selecionados.splice(idx, 1);
        }
        else {
           titulos.selecionados.push(numero);
        }
		titulos.totaliza(scope);
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

app.controller('TitulosCtrl', function ($scope, Empresas, Vendedores, Titulos, XmlNotas, $rootScope) {
    $scope.loading = false;
    $scope.dataInicial = DataValida('01');
    $scope.dataFinal = DataValida('31');
    $scope.titulos = Titulos;    
    $scope.pagamento = "todos";

    /* Baixa a lista de empresas para preencher o combobox */
    Empresas.carregar(function () {
        $scope.empresas = Empresas.lista();
        $scope.empresa_id = Empresas.selecionada();
        $scope.listarTitulos();
    });

    Vendedores.carregar(function () {
        $scope.vendedores = Vendedores.lista();
        $scope.vendedor_id = 1;
    });

    /* Baixa a lista de títulos para preencher a grade */
    $scope.listarTitulos = function () {
        $scope.loading = true;
        Titulos.carregar($scope)
            .then(function () {
                $scope.loading = false;
            });
    };

    /* Envia o comando para iniciar a geração do XML */
    $scope.baixaXML = function () {
        $rootScope.baixando = true;
        XmlNotas.baixar($scope.titulos.selecionados, function (nome_arquivo) {
            $scope.$apply(function () {
                $scope.notafiscal = 'xml/baixar/'+nome_arquivo;
                $rootScope.baixando = false;
            });
        });
    }

    $scope.$on('totaliza', function (e) {
        $scope.qtde_titulos_selecionados = Titulos.selecionados.quantidade;
        $scope.total_titulos_selecionados = Titulos.selecionados.total;
    });

    $scope.toggleSelection = function (numero) {
        Titulos.marca_desmarca($scope, numero);
	}
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
