/**
 * @ngdoc overview
 * @name jp.angular.ui
 *
 * @description
 * The module containing all UI components
 */
define(
    [
        'views',
        'angular-sanitize',
        'angular-bootstrap',
        'angular-bootstrap-tpls'
        // 'videogular',
        // 'videogular-buffering',
        // 'videogular-controls',
        // 'videogular-overlay-play',
        // 'videogular-poster'
    ],
    function (views) {
        var module = angular
            .module('jp.angular.ui', [
                'ngSanitize',
                'ui.bootstrap'
                // 'com.2fdevs.videogular',
                // 'com.2fdevs.videogular.plugins.controls',
                // 'com.2fdevs.videogular.plugins.overlayplay',
                // 'com.2fdevs.videogular.plugins.buffering',
                // 'com.2fdevs.videogular.plugins.poster'
            ])
            .run(['$templateCache', views.init]);
        return module;
    }
);