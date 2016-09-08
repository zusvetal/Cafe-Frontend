angular.module('goodsApp')
        .config(function ($httpProvider) {
            $httpProvider.interceptors.push('TokenInterceptor');
        })
        .run(function ($rootScope, $location,UserService, AuthenticationService) {
            $rootScope.$on('$routeChangeStart', function (event, nextRoute, currentRoute) {
                if(nextRoute.$$route.originalPath==='/logout'){
                      UserService.logOut();
                      $location.path('/login');
                }
                if (nextRoute.access.requiredLogin && !AuthenticationService.isLogged) {
                    $location.path('/login');
                }
            });
        })
        .factory('AuthenticationService', function () {
            var auth = {
                isLogged: true
            };
            return auth;
        })
        .factory('UserService', ['$http','Token','apiServer', function ($http,Token, apiServer) {
                return {
                    logIn: function (username, password) {
                        return $http.post(apiServer + '/login', {username: username, password: password});
                    },
                    logOut: function () {
                        Token.remove();
                    }
                }
            }])
        .factory('TokenInterceptor', ['$q','$window','$location','AuthenticationService','Token',
                    function ($q, $window, $location, AuthenticationService,Token) {
            return {
                request: function (config) {
                    config.headers = config.headers || {};
                    if (Token.getBody()) {
                        config.headers.Authorization = 'Bearer ' + Token.getBody();
                    }
                    return config;
                },
                requestError: function (rejection) {
                    return $q.reject(rejection);
                },
                response: function (response) {
                    if (response !== null && response.status === 200 && Token.getBody() && !AuthenticationService.isLogged) {
                        AuthenticationService.isLogged = true;
                    }
                    return response || $q.when(response);
                },
                /* Revoke client authentication if 401 is received */
                responseError: function (rejection) {
                    if (rejection !== null && rejection.status === 401 || rejection.status === -1) {
                       Token.remove();
                       AuthenticationService.isLogged = false;
                       $location.path('/login');
                    }
                    return $q.reject(rejection); 
                }
            };
        }])
        .factory('Token',['$window',function($window){
                return{
                    add:function(token){
                        $window.sessionStorage.token=token;                       
                    },
                    remove:function(){
                       delete $window.sessionStorage.token; 
                    },
                    getBody: function(){return $window.sessionStorage.token}
                };
        }])
        .controller('AdminUserCtrl', ['$scope', '$location', '$window', 'UserService', 'AuthenticationService','Token',
            function AdminUserCtrl($scope, $location, $window, UserService, AuthenticationService,Token) {
                $scope.logIn = function logIn(username, password) {
                    if (username !== undefined && password !== undefined) {
                        UserService.logIn(username, password)
                                .success(function (data) {
                                    AuthenticationService.isLogged = true;
                                    Token.add(data.token);
                                    $location.path('/purchases');
                                })
                                .error(function (status, data) {
                                    $scope.warning="Логін або пароль введені невірно"
                                    console.log(status);
                                    console.log(data);
                                });
                    }
                };
            }
        ]);



