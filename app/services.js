var app = angular.module('goodsApp')
        .factory('Category', ['$resource', 'apiServer', function ($resource, apiServer) {
                return $resource(apiServer + '/categories/:id', {id: '@id'}, {
                    update: {
                        method: 'PUT'
                    }
                });
            }])
        .factory('Good', ['$resource', 'apiServer', function ($resource, apiServer) {
                return $resource(apiServer + '/goods/:id', {id: '@id'}, {
                    update: {
                        method: 'PUT'
                    }
                });
            }])
        .factory('Purchase', ['$resource', 'apiServer', function ($resource, apiServer) {
                return $resource(apiServer + '/purchases/:id', {id: '@id'}, {
                    update: {
                        method: 'PUT'
                    },
                    getLast: {
                        method: 'GET',
                        params: {
                            id: 'last'                                                       
                        }
                    },
                    getByProduct: {
                        method: 'GET',
                        isArray: true,
                        url: apiServer + '/purchases/good/:id',
                        transformResponse: function (data) {
//                            console.log(data);
                               return data.trim() ? angular.fromJson(data):false;  
                        }
                    }
                });
            }])
        .factory('PurchaseItem', ['$resource', 'apiServer', function ($resource, apiServer) {
                return $resource(apiServer + '/purchaseItems/:id', {id: '@id'}, {
                    update: {
                        method: 'PUT'
                    }
                });
            }])
        .factory('PurchasesList', ['$uibModal', function ($uibModal) {
                return {
                    getList: function (item) {
                        var data = {
                            title: 'Закупки в яких знайдений даний товар',
                            info:  'Для видалення даного товару необхідно\
                                      його спочатку видалити з закупок'
                        };
                        var settings = {
                            animation:true,
                            templateUrl: '/views/sections/purchases_list2.html',
                            resolve: {
                                data: function () {
                                    return data;
                                }
                            },
                            controller: function ($scope,$location, data) {
                                $scope.data = angular.copy(data);
                                $scope.item = item;
                                $scope.redirectTo=function(purchaseId){
                                    $location.path('/purchases/'+purchaseId);
                                }
                            }
                        }
                        return $uibModal.open(settings).result;
                    }
                }
            }])
        .factory('$alert', ['$uibModal', function ($uibModal) {
                return function (data, settings) {
                    var defaultLabels = {
                        ok:'OK',
                        templateHeader:'<div class="alert alert-warning" align="center">\
                                            <span class="glyphicon glyphicon-warning-sign warn-sign"></span>\
                                            <div align="center"><b ng-bind="data.text" ></b></div>\
                                        </div>'
                    };
                    var defaultSettings = {
                        animation:true,
                        size:'sm',
                        templateUrl: '/views/sections/alert.html',
                        resolve: {
                            data: function () {
                                return data;
                            }
                        },
                        controller:function($scope,$uibModalInstance,$sce,data){
                            $scope.data = angular.copy(data);
                            $scope.headerHtml=$sce.trustAsHtml(data.templateHeader);
                            $scope.ok=function(){
                                $uibModalInstance.close();
                            }
                        }
                    }
                    settings = angular.extend(defaultSettings, (settings || {}));
                    data = angular.extend({},defaultLabels, data || {});

                    if ('templateUrl' in settings && 'template' in settings) {
                        delete settings.template;
                    }
                    return $uibModal.open(settings).result;
                };
            }])

        