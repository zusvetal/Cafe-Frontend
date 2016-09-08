var app = angular.module('goodsApp',
['ngRoute', 'ngResource','ngAnimate', 'angular-confirm', 'ui.bootstrap'])
        .constant('apiServer', 'http://10.46.202.200:888')
        .config(['$routeProvider', '$locationProvider', function ($routeProvider, $locationProvider) {
                $routeProvider
                        .when('/', {
                            access: {requiredLogin: true}
                        })
                        .when('/login', {
                            templateUrl: '/views/login.html',
                            controller: 'AdminUserCtrl',
                            access: {requiredLogin: false}
                        })
                        .when('/logout', {
                          redirectTo:'/login',
                          access: {requiredLogin: false},
                        })
                        .when('/purchases', {
                            templateUrl: '/views/purchases.html',
                            controller: 'purchaseCtrl',
                            access: {requiredLogin: true}
                        })
                        .when('/purchases/:idPurchase', {
                            templateUrl: '/views/purchases.html',
                            controller: 'purchaseCtrl',
                            access: {requiredLogin: true}
                        })
                        .when('/goodList', {
                            templateUrl: '/views/good_list.html',
                            controller: 'goodListCtrl',
                            access: {requiredLogin: true}
                        })
                        .when('/expenses', {
                            templateUrl: '/views/expenses.html',
                            controller: 'expensesCtrl',
                            access: {requiredLogin: true}
                        })
                        .otherwise({
                            redirectTo: '/',
                            access: {requiredLogin: true}
                        });
            }])
                .config(['$uibTooltipProvider',function($uibTooltipProvider){
                      $uibTooltipProvider.options({
                          placement:'auto bottom',
                          appendToBody:false
                      })  
            }])
        
