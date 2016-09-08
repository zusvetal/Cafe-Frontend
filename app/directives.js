angular.module('goodsApp')
.directive('modalDialog', function() {
    return {
        restrict: 'E',
        scope: {
            show: '=',
            modalSettings:'='
        },
        replace: true,
        templateUrl: 'views/sections/modal_window.html',
        link: function (scope, element, attrs) {
            scope.$watch('show', function (newVal) {
                var settings = scope[attrs.modalSettings];
                if (newVal) {                 
                    scope.bodySrc = settings.body;
                    scope.title = settings.title;
                    scope.settings=settings;
                    scope.hideModal=function(){
                        element.modal('hide');
                    };
                    
                    element.modal('show');                    
                    element.one('shown.bs.modal', function () {
                        element.find('input').focus();
                    });
                    element.one('hidden.bs.modal', function () {
                        scope.bodySrc=false;
                        scope.show = false;
                        scope.$apply();
                    });
                }
            });
        }     
    };
})


