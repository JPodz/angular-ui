define(
    [
        'ui/module'
    ],
    function definePopoverMenu(module) {
        module.controller('PopoverMenuController', [
            '$scope',
            function definePopoverMenuController($scope) {

                // Sets the trigger element to the provided element. This will be read in later and added to the template
                // as the element that is clicked to toggle the display of the popover menu.
                this.setTriggerElement = function (element) {
                    this.triggerElement = element;
                }
            }
        ]);

        module.directive('jpPopoverMenuTrigger', [
            function definePopoverMenuTriggerDirective() {
                return {
                    restrict: 'AE',
                    transclude: true,
                    replace: true,
                    require: '?^jpPopoverMenu',
                    link: function (scope, element, attrs, controller, transclude) {
                        controller.setTriggerElement(transclude(scope, angular.noop));
                    }
                }
            }
        ]);

        module.directive('jpPopoverMenuTransclude', [
            function definePopoverMenuTransclude() {
                return {
                    require: '?^jpPopoverMenu',
                    link: function (scope, element, attrs, controller) {
                        scope.$watch(
                            function watchTriggerElement () { 
                                return controller[attrs.jpPopoverMenuTransclude]; 
                            },
                            function triggerElementChanged (triggerElement) {
                                if (triggerElement) {
                                    element.html(triggerElement);
                                }
                            }
                        );
                    }
                }
            }
        ]);

        return module.directive('jpPopoverMenu', [
            function definePopoverMenuDirective() {
                return {
                    restrict: 'AE',
                    templateUrl: 'ui/popover-menu/popover-menu.html',
                    controller: 'PopoverMenuController',
                    transclude: true
                }
            }
        ]);
    }
);