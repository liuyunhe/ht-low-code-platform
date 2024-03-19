/*
 * Activiti Modeler component part of the Activiti project
 * Copyright 2005-2014 Alfresco Software, Ltd. All rights reserved.
 * 
 * This library is free software; you can redistribute it and/or
 * modify it under the terms of the GNU Lesser General Public
 * License as published by the Free Software Foundation; either
 * version 2.1 of the License, or (at your option) any later version.
 *
 * This library is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the GNU
 * Lesser General Public License for more details.

 * You should have received a copy of the GNU Lesser General Public
 * License along with this library; if not, write to the Free Software
 * Foundation, Inc., 51 Franklin Street, Fifth Floor, Boston, MA  02110-1301  USA
 */
//目前服务任务注释  要用在stencilset.json 788行加上就行
//  }, {
//    "type" : "node",
//    "id" : "ServiceTask",
//    "title" : "服务任务",
//    "description" : "服务任务",
//    "view" : "<?xml version=\"1.0\" encoding=\"UTF-8\" standalone=\"no\"?>\n<svg\n   xmlns=\"http://www.w3.org/2000/svg\"\n   xmlns:svg=\"http://www.w3.org/2000/svg\"\n   xmlns:oryx=\"http://www.b3mn.org/oryx\"\n   xmlns:xlink=\"http://www.w3.org/1999/xlink\"\n\n   width=\"102\"\n   height=\"48\"\n   version=\"1.0\">\n  <defs></defs>\n  <oryx:magnets>\n  \t<oryx:magnet oryx:cx=\"1\" oryx:cy=\"5\" oryx:anchors=\"left\" />\n  \t<oryx:magnet oryx:cx=\"1\" oryx:cy=\"23\" oryx:anchors=\"left\" />\n  \t<oryx:magnet oryx:cx=\"1\" oryx:cy=\"41\" oryx:anchors=\"left\" />\n  \t\n  \t<oryx:magnet oryx:cx=\"25\" oryx:cy=\"46\" oryx:anchors=\"bottom\" />\n  \t<oryx:magnet oryx:cx=\"50\" oryx:cy=\"46\" oryx:anchors=\"bottom\" />\n  \t<oryx:magnet oryx:cx=\"75\" oryx:cy=\"46\" oryx:anchors=\"bottom\" />\n  \t\n  \t<oryx:magnet oryx:cx=\"99\" oryx:cy=\"5\" oryx:anchors=\"right\" />\n  \t<oryx:magnet oryx:cx=\"99\" oryx:cy=\"23\" oryx:anchors=\"right\" />\n  \t<oryx:magnet oryx:cx=\"99\" oryx:cy=\"41\" oryx:anchors=\"right\" />\n  \t\n  \t<oryx:magnet oryx:cx=\"25\" oryx:cy=\"1\" oryx:anchors=\"top\" />\n  \t<oryx:magnet oryx:cx=\"50\" oryx:cy=\"1\" oryx:anchors=\"top\" />\n  \t<oryx:magnet oryx:cx=\"75\" oryx:cy=\"1\" oryx:anchors=\"top\" />\n  \t\n  \t<oryx:magnet oryx:cx=\"50\" oryx:cy=\"23\" oryx:default=\"yes\" />\n  </oryx:magnets>\n  <g pointer-events=\"fill\" oryx:minimumSize=\"50 40\">\n\t<rect id=\"text_frame\" oryx:anchors=\"bottom top right left\" x=\"1\" y=\"1\" width=\"94\" height=\"45\" rx=\"10\" ry=\"10\" stroke=\"none\" stroke-width=\"0\" fill=\"none\" />\n\t<rect id=\"bg_frame\" oryx:resize=\"vertical horizontal\" x=\"0\" y=\"0\" width=\"100\" height=\"45\" rx=\"10\" ry=\"10\" stroke=\"#bbbbbb\" stroke-width=\"1\" fill=\"#f9f9f9\" />\n\t\t<text \n\t\t\tfont-size=\"12\" \n\t\t\tid=\"text_name\" \n\t\t\tx=\"50\" \n\t\t\ty=\"20\" \n\t\t\toryx:align=\"middle center\"\n\t\t\toryx:fittoelem=\"text_frame\"\n\t\t\tstroke=\"#373e48\">\n\t\t</text>\n\t\n\t<g id=\"serviceTask\" transform=\"translate(3,3)\">\n\t<path oryx:anchors=\"top left\"\n\t\tstyle=\"fill:#72a7d0;stroke:none\"\n     d=\"M 8,1 7.5,2.875 c 0,0 -0.02438,0.250763 -0.40625,0.4375 C 7.05724,3.330353 7.04387,3.358818 7,3.375 6.6676654,3.4929791 6.3336971,3.6092802 6.03125,3.78125 6.02349,3.78566 6.007733,3.77681 6,3.78125 5.8811373,3.761018 5.8125,3.71875 5.8125,3.71875 l -1.6875,-1 -1.40625,1.4375 0.96875,1.65625 c 0,0 0.065705,0.068637 0.09375,0.1875 0.002,0.00849 -0.00169,0.022138 0,0.03125 C 3.6092802,6.3336971 3.4929791,6.6676654 3.375,7 3.3629836,7.0338489 3.3239228,7.0596246 3.3125,7.09375 3.125763,7.4756184 2.875,7.5 2.875,7.5 L 1,8 l 0,2 1.875,0.5 c 0,0 0.250763,0.02438 0.4375,0.40625 0.017853,0.03651 0.046318,0.04988 0.0625,0.09375 0.1129372,0.318132 0.2124732,0.646641 0.375,0.9375 -0.00302,0.215512 -0.09375,0.34375 -0.09375,0.34375 L 2.6875,13.9375 4.09375,15.34375 5.78125,14.375 c 0,0 0.1229911,-0.09744 0.34375,-0.09375 0.2720511,0.147787 0.5795915,0.23888 0.875,0.34375 0.033849,0.01202 0.059625,0.05108 0.09375,0.0625 C 7.4756199,14.874237 7.5,15.125 7.5,15.125 L 8,17 l 2,0 0.5,-1.875 c 0,0 0.02438,-0.250763 0.40625,-0.4375 0.03651,-0.01785 0.04988,-0.04632 0.09375,-0.0625 0.332335,-0.117979 0.666303,-0.23428 0.96875,-0.40625 0.177303,0.0173 0.28125,0.09375 0.28125,0.09375 l 1.65625,0.96875 1.40625,-1.40625 -0.96875,-1.65625 c 0,0 -0.07645,-0.103947 -0.09375,-0.28125 0.162527,-0.290859 0.262063,-0.619368 0.375,-0.9375 0.01618,-0.04387 0.04465,-0.05724 0.0625,-0.09375 C 14.874237,10.52438 15.125,10.5 15.125,10.5 L 17,10 17,8 15.125,7.5 c 0,0 -0.250763,-0.024382 -0.4375,-0.40625 C 14.669647,7.0572406 14.641181,7.0438697 14.625,7 14.55912,6.8144282 14.520616,6.6141566 14.4375,6.4375 c -0.224363,-0.4866 0,-0.71875 0,-0.71875 L 15.40625,4.0625 14,2.625 l -1.65625,1 c 0,0 -0.253337,0.1695664 -0.71875,-0.03125 l -0.03125,0 C 11.405359,3.5035185 11.198648,3.4455201 11,3.375 10.95613,3.3588185 10.942759,3.3303534 10.90625,3.3125 10.524382,3.125763 10.5,2.875 10.5,2.875 L 10,1 8,1 z m 1,5 c 1.656854,0 3,1.3431458 3,3 0,1.656854 -1.343146,3 -3,3 C 7.3431458,12 6,10.656854 6,9 6,7.3431458 7.3431458,6 9,6 z\" />\n\t</g>\n  \n\t\n  </g>\n</svg>",
//    "icon" : "activity/list/type.service.png",
//    "groups" : [ "任务" ],
//    "propertyPackages" : [ "overrideidpackage", "namepackage","servicetaskdelegateexpressionpackage"],
//    "hiddenPropertyPackages" : [ ],
//    "roles" : [ "Activity", "sequence_start", "sequence_end", "ActivitiesMorph", "all" ]
//目前泳道注释  要用在stencilset.json 876行加上就行
// }, {
//     "type" : "node",
//         "id" : "Pool",
//         "title" : "泳池",
//         "description" : "",
//         "view" : "<?xml version=\"1.0\" encoding=\"UTF-8\" standalone=\"no\"?>\n<svg\n   xmlns=\"http://www.w3.org/2000/svg\"\n   xmlns:svg=\"http://www.w3.org/2000/svg\"\n   xmlns:oryx=\"http://www.b3mn.org/oryx\"\n   xmlns:xlink=\"http://www.w3.org/1999/xlink\"\n   width=\"600\"\n   height=\"250\"\n   version=\"1.0\">\n  <defs></defs>\n  <oryx:magnets>\n  \t<oryx:magnet oryx:cx=\"0\" oryx:cy=\"124\" oryx:anchors=\"left\" />\n  \t<oryx:magnet oryx:cx=\"299\" oryx:cy=\"249\" oryx:anchors=\"bottom\" />\n  \t<oryx:magnet oryx:cx=\"599\" oryx:cy=\"124\" oryx:anchors=\"right\" />\n  \t<oryx:magnet oryx:cx=\"299\" oryx:cy=\"0\" oryx:anchors=\"top\" />\n  \t<oryx:magnet oryx:cx=\"299\" oryx:cy=\"124\" oryx:default=\"yes\" />\n  </oryx:magnets>\n  <g pointer-events=\"none\" >\n    <defs>\n\t\t<radialGradient id=\"background\" cx=\"0%\" cy=\"10%\" r=\"100%\" fx=\"20%\" fy=\"10%\">\n\t\t\t<stop offset=\"0%\" stop-color=\"#ffffff\" stop-opacity=\"1\"/>\n\t\t\t<stop id=\"fill_el\" offset=\"100%\" stop-color=\"#ffffff\" stop-opacity=\"1\"/>\n\t\t</radialGradient>\n\t</defs>\n\t  \t\n  \t<rect\n  \t\tid=\"border\"\n  \t\tclass=\"stripable-element-force\"\n  \t\toryx:resize=\"vertical horizontal\"\n  \t\tx=\"0\"\n  \t\ty=\"0\"\n  \t\twidth=\"600\"\n  \t\theight=\"250\"\n  \t\tfill=\"none\"\n  \t\tstroke-width=\"9\"\n  \t\tstroke=\"none\"\n  \t\tvisibility=\"visible\"\n  \t\tpointer-events=\"stroke\"\n  \t/>\n    <rect\n    \tid=\"c\"\n    \toryx:resize=\"vertical horizontal\"\n    \tx=\"0\"\n    \ty=\"0\"\n    \twidth=\"600\" \n    \theight=\"250\" \n    \tstroke=\"black\" \n    \tfill=\"url(#background) white\"\n    \tfill-opacity=\"0.3\" \n    />\n    \n\t<rect \n\t\tid=\"caption\"\n\t\toryx:anchors=\"left top bottom\"\n\t\tx=\"0\"\n\t\ty=\"0\"\n\t\twidth=\"30\"\n\t\theight=\"250\"\n\t\tstroke=\"black\"\n\t\tstroke-width=\"1\"\n\t\tfill=\"url(#background) white\"\n\t\tpointer-events=\"all\"\n\t/>\n\t\n\t<rect \n\t\tid=\"captionDisableAntialiasing\"\n\t\toryx:anchors=\"left top bottom\"\n\t\tx=\"0\"\n\t\ty=\"0\"\n\t\twidth=\"30\"\n\t\theight=\"250\"\n\t\tstroke=\"black\"\n\t\tstroke-width=\"1\"\n\t\tfill=\"url(#background) white\"\n\t\tpointer-events=\"all\"\n\t/>\n\t\n    <text x=\"13\" y=\"125\" font-size=\"12\" id=\"text_name\" oryx:fittoelem=\"caption\" oryx:align=\"middle center\" oryx:anchors=\"left\" oryx:rotate=\"270\" fill=\"black\" stroke=\"black\"></text>\n    \n  </g>\n</svg>",
//         "icon" : "swimlane/pool.png",
//         "groups" : [ "泳道" ],
//         "layout" : [ {
//         "type" : "layout.bpmn2_0.pool"
//     } ],
//         "propertyPackages" : [ "overrideidpackage", "namepackage", "documentationpackage", "process_idpackage" ],
//         "hiddenPropertyPackages" : [ ],
//         "roles" : [ "canContainArtifacts", "all" ]
// }, {
//     "type" : "node",
//         "id" : "Lane",
//         "title" : "泳道",
//         "description" : "",
//         "view" : "<?xml version=\"1.0\" encoding=\"UTF-8\" standalone=\"no\"?>\n<svg\n   xmlns=\"http://www.w3.org/2000/svg\"\n   xmlns:svg=\"http://www.w3.org/2000/svg\"\n   xmlns:oryx=\"http://www.b3mn.org/oryx\"\n   xmlns:xlink=\"http://www.w3.org/1999/xlink\"\n   width=\"600\"\n   height=\"250\"\n   version=\"1.0\">\n  <defs></defs>\n  <g pointer-events=\"none\" >\n  \n     <defs>\n\t\t<radialGradient id=\"background\" cx=\"0%\" cy=\"10%\" r=\"200%\" fx=\"20%\" fy=\"10%\">\n\t\t\t<stop offset=\"0%\" stop-color=\"#ffffff\" stop-opacity=\"1\"/>\n\t\t\t<stop id=\"fill_el\" offset=\"100%\" stop-color=\"#ffffff\" stop-opacity=\"0\"/>\n\t\t</radialGradient>\n\t</defs>\n\t\n  \t<rect id=\"border_invisible\" class=\"stripable-element-force\" oryx:resize=\"vertical horizontal\" x=\"0\" y=\"0\" width=\"600\" height=\"250\" fill=\"none\" stroke-width=\"10\" stroke=\"white\" visibility=\"hidden\" pointer-events=\"stroke\"/>\t\t\n\t<rect id=\"border\" oryx:resize=\"vertical horizontal\" x=\"0\" y=\"0\" width=\"600\" height=\"250\" stroke=\"black\" stroke-width=\"1\" fill=\"url(#background) white\" pointer-events=\"none\" />\n\t\n\t\n\t<rect \n\t\tid=\"caption\"\n\t\toryx:anchors=\"left top bottom\"\n\t\tx=\"0\"\n\t\ty=\"1\"\n\t\twidth=\"30\"\n\t\theight=\"248\"\n\t\tstroke=\"black\"\n\t\tstroke-width=\"0\"\n\t\tfill=\"white\"\n\t\tvisibility=\"hidden\"\n\t\tclass=\"stripable-element-force\"\n\t\tpointer-events=\"all\"\n\t/>\n\t\n\t<path\n\t\tstroke=\"black\"\n\t\tstroke-width=\"1\"\n\t\tfill=\"none\"\n\t\td=\"M 0,0 L 0,250\"\n        oryx:anchors=\"left top bottom\"\n        id=\"captionDisableAntialiasing\"\n    />\n\t\n\t<!--rect \n\t\tid=\"captionDisableAntialiasing\"\n\t\toryx:anchors=\"left top bottom\"\n\t\tx=\"0\"\n\t\ty=\"0\"\n\t\twidth=\"30\"\n\t\theight=\"250\"\n\t\tstroke=\"black\"\n\t\tstroke-width=\"1\"\n\t\tfill=\"url(#background) white\"\n\t/-->\n\t\n    <text \n\t\tx=\"13\"\n\t\ty=\"125\"\n\t\toryx:rotate=\"270\" \n\t\tfont-size=\"12\" \n\t\tid=\"text_name\" \n\t\toryx:align=\"middle center\" \n\t\toryx:anchors=\"left\"\n\t\toryx:fittoelem=\"caption\"\n\t\tfill=\"black\" \n\t\tstroke=\"black\">\n\t</text>\n  </g>\n</svg>",
//         "icon" : "swimlane/lane.png",
//         "groups" : [ "泳道" ],
//         "hide":true,
//         "propertyPackages" : [ "overrideidpackage", "namepackage", "documentationpackage" ],
//         "hiddenPropertyPackages" : [ ],
//         "roles" : []
'use strict';

angular.module('activitiModeler')
    .controller('ToolbarController', ['$scope', '$http', '$modal', '$q', '$rootScope', '$translate', '$location', function ($scope, $http, $modal, $q, $rootScope, $translate, $location) {
        $scope.editorFactory.promise.then(function () {
            $scope.items = KISBPM.TOOLBAR_CONFIG.items;
        });

        $scope.secondaryItems = KISBPM.TOOLBAR_CONFIG.secondaryItems;

        // Call configurable click handler (From http://stackoverflow.com/questions/359788/how-to-execute-a-javascript-function-when-i-have-its-name-as-a-string)
        var executeFunctionByName = function (functionName, context /*, args */) {
            var args = Array.prototype.slice.call(arguments).splice(2);
            var namespaces = functionName.split(".");
            var func = namespaces.pop();
            for (var i = 0; i < namespaces.length; i++) {
                context = context[namespaces[i]];
            }
            return context[func].apply(this, args);
        };

        // Click handler for toolbar buttons
        $scope.toolbarButtonClicked = function (buttonIndex) {

            // Default behaviour
            var buttonClicked = $scope.items[buttonIndex];
            var services = { '$scope': $scope, '$rootScope': $rootScope, '$http': $http, '$modal': $modal, '$q': $q, '$translate': $translate };
            executeFunctionByName(buttonClicked.action, window, services);

            // Other events
            var event = {
                type: KISBPM.eventBus.EVENT_TYPE_TOOLBAR_BUTTON_CLICKED,
                toolbarItem: buttonClicked
            };
            KISBPM.eventBus.dispatch(event.type, event);
        };

        // Click handler for secondary toolbar buttons
        $scope.toolbarSecondaryButtonClicked = function (buttonIndex) {
            var buttonClicked = $scope.secondaryItems[buttonIndex];
            var services = { '$scope': $scope, '$http': $http, '$modal': $modal, '$q': $q, '$translate': $translate, '$location': $location };
            executeFunctionByName(buttonClicked.action, window, services);
        };

        /* Key bindings */
        Mousetrap.bind(['command+z', 'ctrl+z'], function (e) {
            var services = { '$scope': $scope, '$rootScope': $rootScope, '$http': $http, '$modal': $modal, '$q': $q, '$translate': $translate };
            KISBPM.TOOLBAR.ACTIONS.undo(services);
            return false;
        });

        Mousetrap.bind(['command+y', 'ctrl+y'], function (e) {
            var services = { '$scope': $scope, '$rootScope': $rootScope, '$http': $http, '$modal': $modal, '$q': $q, '$translate': $translate };
            KISBPM.TOOLBAR.ACTIONS.redo(services);
            return false;
        });

        Mousetrap.bind(['command+c', 'ctrl+c'], function (e) {
            var services = { '$scope': $scope, '$rootScope': $rootScope, '$http': $http, '$modal': $modal, '$q': $q, '$translate': $translate };
            KISBPM.TOOLBAR.ACTIONS.copy(services);
            return false;
        });

        Mousetrap.bind(['command+v', 'ctrl+v'], function (e) {
            var services = { '$scope': $scope, '$rootScope': $rootScope, '$http': $http, '$modal': $modal, '$q': $q, '$translate': $translate };
            KISBPM.TOOLBAR.ACTIONS.paste(services);
            return false;
        });

        Mousetrap.bind(['del'], function (e) {
            var services = { '$scope': $scope, '$rootScope': $rootScope, '$http': $http, '$modal': $modal, '$q': $q, '$translate': $translate };
            KISBPM.TOOLBAR.ACTIONS.deleteItem(services);
            return false;
        });

        /* Undo logic */

        $scope.undoStack = [];
        $scope.redoStack = [];

        $scope.editorFactory.promise.then(function () {

            // Catch all command that are executed and store them on the respective stacks
            $scope.editor.registerOnEvent(ORYX.CONFIG.EVENT_EXECUTE_COMMANDS, function (evt) {

                // If the event has commands
                if (!evt.commands) { return; }

                $scope.undoStack.push(evt.commands);
                $scope.redoStack = [];

                for (var i = 0; i < $scope.items.length; i++) {
                    var item = $scope.items[i];
                    if (item.action === 'KISBPM.TOOLBAR.ACTIONS.undo') {
                        item.enabled = true;
                    }
                    else if (item.action === 'KISBPM.TOOLBAR.ACTIONS.redo') {
                        item.enabled = false;
                    }
                }

                // Update
                $scope.editor.getCanvas().update();
                $scope.editor.updateSelection();

            });

        });

        // Handle enable/disable toolbar buttons 
        $scope.editorFactory.promise.then(function () {
            $scope.editor.registerOnEvent(ORYX.CONFIG.EVENT_SELECTION_CHANGED, function (evt) {
                var elements = evt.elements;

                for (var i = 0; i < $scope.items.length; i++) {
                    var item = $scope.items[i];
                    if (item.enabledAction && item.enabledAction === 'element') {
                        var minLength = 1;
                        if (item.minSelectionCount) {
                            minLength = item.minSelectionCount;
                        }
                        if (elements.length >= minLength && !item.enabled) {
                            $scope.safeApply(function () {
                                item.enabled = true;
                            });
                        }
                        else if (elements.length == 0 && item.enabled) {
                            $scope.safeApply(function () {
                                item.enabled = false;
                            });
                        }
                    }
                }
            });

        });

    }]);