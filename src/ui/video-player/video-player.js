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
                $scope.config = {
                    sources: [
                        {src: $sce.trustAsResourceUrl("http://static.videogular.com/assets/videos/videogular.mp4"), type: "video/mp4"},
                        {src: $sce.trustAsResourceUrl("http://static.videogular.com/assets/videos/videogular.webm"), type: "video/webm"},
                        {src: $sce.trustAsResourceUrl("http://static.videogular.com/assets/videos/videogular.ogg"), type: "video/ogg"}
                    ],
                    tracks: [
                        {
                            src: "http://www.videogular.com/assets/subs/pale-blue-dot.vtt",
                            kind: "subtitles",
                            srclang: "en",
                            label: "English",
                            default: ""
                        }
                    ],
                    plugins: {
                        poster: "http://www.videogular.com/assets/images/videogular.png"
                    }
                };
            }
        ]);
        return module.directive('jpVideoPlayer', [
            function defineVideoPlayerDirective() {
                return {
                    restrict: 'AE',
                    templateUrl: 'ui/video-player/video-player.html',
                    controller: 'VideoPlayerController'
                }
            }
        ]);
    }
);