define(
    [
        'main'
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
                    templateUrl: 'hamburger-menu/hamburger-menu.html',
                    controller: 'HamburgerMenuController'
                }
            }
        ]);
    }
);