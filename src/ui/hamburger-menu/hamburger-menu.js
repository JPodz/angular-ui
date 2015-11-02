/**
 * @ngdoc directive
 * @name jp.angular.ui.directive:jpHamburgerMenu
 * @restrict AE
 *
 * @description
 * Displays a static hamburger button, commonly found in mobile apps
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
    function defineHamburgerMenu(module) {
        module.controller('HamburgerMenuController', [
            function defineHamburgerMenuController() {
                
            }
        ]);
        return module.directive('jpHamburgerMenu', [
            function defineHamburgerMenuDirective() {
                return {
                    restrict: 'AE',
                    templateUrl: 'ui/hamburger-menu/hamburger-menu.html',
                    controller: 'HamburgerMenuController'
                }
            }
        ]);
    }
);