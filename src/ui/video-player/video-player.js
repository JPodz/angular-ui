/**
 * @ngdoc directive
 * @name jp.angular.ui.directive:jpVideoPlayer
 * @restrict AE
 *
 * @description
 * Displays a video player
 *
 * @example
   <example module="jp.ui">
     <file name="ui/hamburger-menu/hamburger-menu.html">
         <div jp-hamburger-menu></div>
     </file>
   </example>
 */
define(
    [
        'ui/module'
    ],
    function defineVideoPlayer(module) {
        module.controller('VideoPlayerController', [
            '$scope',
            '$sce',
            function defineVideoPlayerController($scope, $sce) {

            }
        ]);
        return module.directive('jpVideoPlayer', [
            function defineVideoPlayerDirective() {
                return {
                    restrict: 'AE',
                    templateUrl: 'ui/video-player/video-player.html',
                    controller: 'VideoPlayerController',
                    scope: {
                        config: '@'
                    }
                }
            }
        ]);
    }
);