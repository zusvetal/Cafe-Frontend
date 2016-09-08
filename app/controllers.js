angular.module('goodsApp')
        .controller('navCtrl', ['$scope','$rootScope', function ($scope,$rootScope) {
                $rootScope.purchaseLink="#/purchases";
            }])
        .controller('categoryFormCtrl', ['$scope', 'Category', function ($scope, Category) {
                var category = new Category();
                $scope.submit = function (param, isvalid) {
                    if (isvalid) {
                        for (var prop in param) {
                            category[prop] = param[prop];
                        }
                        category.$save()
                                .then(
                                        function (data) {
                                            $scope.$emit('closeCatForm', data.toJSON());
                                            $scope.hideModal();

                                        },
                                        function (data) {
                                            console.log(data);
                                        });
                        $scope.hideModal();
                    }
                }
            }])
        .controller('goodFormCtrl', ['$scope', 'Good', function ($scope, Good) {
                var good = new Good();
                $scope.good = {};
                $scope.good.category_id = $scope.settings.category_id;
                $scope.submit = function (param, isvalid) {
                    if (isvalid) {
                        for (var prop in param) {
                            good[prop] = param[prop];
                        }
                        good.$save()
                                .then(
                                        function (data) {
                                            $scope.$emit('closeGoodForm', data.toJSON());
                                            $scope.hideModal();

                                        },
                                        function (data) {
                                            console.log(data);
                                        });
                        $scope.hideModal();
                    }
                };
            }])
        .controller('purchaseFormCtrl', ['$scope', 'Purchase', function ($scope, Purchase) {
                var purchase = new Purchase();
                $scope.submit = function (param, isvalid) {
                    if (isvalid) {
                        for (var prop in param) {
                            purchase[prop] = param[prop];
                        }
                        purchase.$save()
                                .then(
                                        function (data) {
                                            $scope.$emit('closePurchaseForm', data);
                                            $scope.hideModal();

                                        },
                                        function (data) {
                                            console.log(data);
                                        });
                        $scope.hideModal();
                    }
                };
            }])
        .controller('purchasesListCtrl', ['$scope', 'Purchase', function ($scope, Purchase) {
                Purchase.query()
                        .$promise.then(function (list) {
                            $scope.purchases = list;
                        });
                $scope.choosePurchase = function (id) {
                    $scope.$emit('closePurchasesList', id);
                    $scope.hideModal();
                };
                $scope.isCurrent = function (id) {
                    return ($scope.settings.idCurrentPurchase) == id ? 'info' : '';
                }
            }])
        .controller('goodListCtrl', ['$scope','$confirm','$alert','$q', 'Category', 'Good','Purchase','PurchasesList',
                    function ($scope,$confirm,$alert,$q, Category, Good,Purchase, PurchasesList) {
                $scope.catForm;
                $scope.title = 'Список продуктів';
                $scope.modalShown = false;
                $scope.categories = Category.query();
                $scope.getCategoryForm = function () {
                    $scope.modalSettings = {
                        body: 'views/forms/category_form.html',
                        title: 'Category Form'
                    };
                    $scope.modalShown = true;
                    var off = $scope.$on('closeCatForm', function (event, category) {
                        $scope.categories.unshift(category);
                        off();

                    });
                };
                $scope.getGoodForm = function (index) {
                    var idCategory=$scope.categories[index].id,
                            categoryName=$scope.categories[index].name;
                    $scope.modalSettings = {
                        body: 'views/forms/good_form.html',
                        title: 'Добавити продукт в категорію "' + categoryName + '"',
                        category_id: idCategory
                    };
                    $scope.modalShown = true;
                    var off = $scope.$on('closeGoodForm', function (event, good) {
                        $scope.categories[index].goods.unshift(good);
                        off();
                    });
                };  
                $scope.removeGood = function (j,i) {
                    var good = new Good();
                    good.id = $scope.categories[j].goods[i].id;
                    $confirm({
                        text: 'Ви дійсно хочете видалити продукт з бази даних?',
                        title: 'Видалення продукта',
                        ok: 'так',
                        cancel: 'ні'        
                    },
                    {animation:false}
                            )
                            .then(
                                    function () {
                                          return  Purchase.getByProduct({id:good.id}).$promise;  
                                    })
                            .then(
                                    function (items) {
                                        if (items.length === 0) {
                                           return  good.$delete();
                                        }
                                        else {
                                             PurchasesList.getList(items);
                                             /*Stop chain*/
                                            return $q(function(){return null;})
                                        }
                                    })
                            .then(
                                    function (data) {

                                        $scope.categories[j].goods.splice(i,1);
                                    },
                                    function (data) {
                                        console.log(data);
                                    });
                };
                $scope.removeCategory = function (index) {
                    var cat = new Category(),
                            numberOfProducts=$scope.categories[index].goods.length;
                    cat.id = $scope.categories[index].id;
                    $confirm({
                        text: 'Ви дійсно хочете видалити категорію продуктів з бази',
                        title: 'Видалення категорії',
                        ok: 'так',
                        cancel: 'ні'        
                    },
                    {animation:false}
                            )
                            .then(
                                    function () {
                                        if (numberOfProducts === 0) {
                                            return cat.$delete();
                                        }
                                        else {
                                            $alert({text: 'Категорію неможливо видалити,\
                                                     доки в ній знаходяться продукти'});
                                            /*Stop chain*/
                                            return $q(function(){return null;})
                                        }                                            
                                    })
                            .then(
                                    function (data) {
                                        $scope.categories.splice(index,1);
                                    },
                                    function (data) {
                                        console.log(data);
                                    });
                };
            }])
        .controller('purchaseCtrl', ['$scope', '$rootScope', '$routeParams', 'Purchase', 'Category', 'PurchaseItem',
            function ($scope, $rootScope, $routeParams, Purchase, Category, PurchaseItem) {
                var idPurchase;
                $scope.totalPrice = '';
                $scope.purchaseGoods = {};
                $scope.categories = {};

                var getPurchase = function (id) {
                    Purchase.get({id: id})
                            .$promise.then(function (purchase) {
                                var items = purchase.purchase_items;
                                $scope.title = purchase.name;
                                $scope.purchaseGoods = [];
                                if (items.length !== 0) {
                                    items.forEach(function (item, i, arr) {
                                        $scope.purchaseGoods[item.good_id] = item;
                                    });
                                }
                                totalPrice();
                            });
                };
                var totalPrice = function () {
                    var sum = 0,
                            purch = new Purchase();
                    for (var id in $scope.purchaseGoods) {
                        sum += $scope.purchaseGoods[id].pcs * $scope.purchaseGoods[id].price;
                    }
                    ;
                    purch.expense = sum;
                    purch.$update({id: idPurchase});
                    $scope.totalPrice = sum;

                    return sum;
                };
                if ($routeParams.idPurchase) {
                    idPurchase = $routeParams.idPurchase;
                    getPurchase(idPurchase);
                } else {
                    Purchase.getLast()
                            .$promise.then(function (purchase) {
                                idPurchase = purchase.id;
                                getPurchase(idPurchase);
                            });
                }
                Category.query()
                        .$promise.then(function (cats) {
                            cats.forEach(function (cat) {
                                $scope.categories[cat.id] = cat;
                                cat.goods.forEach(function (good) {
                                    $scope.categories[cat.id][good.id] = good;
                                });
                            });
                        });
                $scope.getPurchaseForm = function () {
                    $scope.modalSettings = {
                        body: 'views/forms/purchase_form.html',
                        title: 'Добавити закупку'
                    };
                    $scope.modalShown = true;
                    var off = $scope.$on('closePurchaseForm', function (event, newPurchase) {
                        idPurchase=newPurchase.id;
                        getPurchase(idPurchase);
                        off();
                    });
                };
                $scope.getPurchasesList = function () {
                    $scope.modalSettings = {
                        body: 'views/sections/purchases_list.html',
                        title: 'Виберіть закупку',
                        idCurrentPurchase: idPurchase
                    };
                    $scope.modalShown = true;
                    var off = $scope.$on('closePurchasesList', function (event, id) {
                        idPurchase = id;
                        $rootScope.purchaseLink="#/purchases/"+id;
                        getPurchase(idPurchase);

                        off();
                    });
                };
                $scope.isBelong = function (idGood) {
                    return typeof $scope.purchaseGoods[idGood] === 'undefined' ?
                            'noBelong' : 'belong';
                };
                $scope.addItem = function (idGood) {
                    var pItem = new PurchaseItem();
                    pItem.good_id = idGood;
                    pItem.purchase_id = idPurchase;
                    pItem.$save()
                            .then(
                                    function (item) {
                                        return pItem.$get({id: item.id});
                                    },
                                    function (data) {
                                        console.error(data);
                                    })
                            .then(
                                    function (item) {
                                        $scope.purchaseGoods[idGood] = item.toJSON();
                                        console.log(item.toJSON());
                                    },
                                    function (data) {
                                        console.error(data);
                                    });
                };
                $scope.delItem = function (idGood) {
                    var idItem = $scope.purchaseGoods[idGood].id;
                    PurchaseItem.delete({id: idItem})
                            .$promise.then(
                                    function (item) {
                                        delete $scope.purchaseGoods[idGood];
                                        totalPrice();
                                    },
                                    function (data) {
                                        console.log(data);
                                    });
                };
                $scope.addGood = function (idCategory,categoryName) {
                    $scope.modalSettings = {
                        body: 'views/forms/good_form.html',
                        title: 'Добавити продукт в категорію "' + categoryName + '"',
                        category_id: idCategory
                    };
                    $scope.modalShown = true;
                    var off = $scope.$on('closeGoodForm', function (event, good) {
                        console.log(good,$scope.categories[idCategory]);
                        $scope.categories[idCategory].goods.push(good);
                        off();
                    });
                };
                $scope.choosingItems = function (idCat) {
                    var goods = $scope.categories[idCat].goods,
                            count = 0;
                    goods.forEach(function (good) {
                        if (typeof $scope.purchaseGoods[good.id] !== 'undefined') {
                            count++;
                        }
                    });
                    return count;
                };
                $scope.pcsManipulate = function (id, value) {
                    var pItem = new PurchaseItem();
                    console.log(value);
                    pItem.pcs = value;
                    pItem.$update({id: id});
                    totalPrice();
                };
                $scope.priceManipulate = function (id, value) {
                    var pItem = new PurchaseItem();
                    pItem.price = value;
                    pItem.$update({id: id});
                    totalPrice();
                };
                $scope.totalItemPrice = function (idGood) {
                    var total = $scope.purchaseGoods[idGood].pcs * $scope.purchaseGoods[idGood].price;
                    return total;
                };
                $scope.totalCatPrice = function (idCat) {
                    var goods = $scope.categories[idCat].goods,
                            sum = 0;
                    goods.forEach(function (good) {
                        if (typeof $scope.purchaseGoods[good.id] !== 'undefined') {
                            sum += $scope.purchaseGoods[good.id].pcs * $scope.purchaseGoods[good.id].price;
                        }
                    });
                    return sum;
                };
                $scope.showTools = '';
                $scope.toggleEditTolls = function () {
                    if ($scope.showTools === 'hidden') {
                        $scope.showTools = '';
                    }
                    else {
                        $scope.showTools = 'hidden';
                    }
                };
                $scope.hasItems = function (catId) {
                    if ($scope.showTools === 'hidden') {

                    }
                };

            }])
        .controller('expensesCtrl', ['$scope', 'Purchase','$location', function ($scope,Purchase,$location) {
                Purchase.query()
                        .$promise.then(function (list) {
                            var sum = 0;
                            var a = {};
                            list.forEach(function (item) {
                                item.expense = Number(item.expense);
                                var d = new Date(item.date),
                                        month = d.toLocaleString('ru', {month: 'numeric', year: 'numeric'});
                                if (!(month in a)) {
                                    a[month] = [];
                                }
                                a[month].push(item);
                                sum += item.expense;
                            })
                            $scope.purchases = a;
                            $scope.totalPrice = sum.toFixed(2);
                        });
                $scope.monthExpense=function(date){
                    var sum=0;
                    $scope.purchases[date].forEach(function(item){
                        sum+=item.expense;
                    });
                    return sum.toFixed(2);
                }
                $scope.redirectTo = function (purchaseId) {
                    $location.path('/purchases/' + purchaseId);
                }
            }]);

