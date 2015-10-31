define(
    [
        'angular',
        'views',
        'hamburger-menu/hamburger-menu'
    ],
    function (angular, views) {
        return angular
            .module('jp-ui', [])
            .run(['$templateCache', views.init]);
    }
);