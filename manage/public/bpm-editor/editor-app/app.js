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
'use strict';

var activitiModeler = angular.module('activitiModeler', [
	'ngCookies',
	'ngResource',
	'ngSanitize',
	'ngRoute',
	'ngDragDrop',
	'mgcrea.ngStrap',
	'ngGrid',
	'ngAnimate',
	'pascalprecht.translate',
	'duScroll',
	'hotentTemplate'
]);

var activitiModule = activitiModeler;

activitiModeler
	// Initialize routes
	.config(['$selectProvider', '$translateProvider', function ($selectProvider, $translateProvider) {

		// Override caret for bs-select directive
		angular.extend($selectProvider.defaults, {
			caretHtml: '&nbsp;<i class="icon icon-caret-down"></i>'
		});

		// Initialize angular-translate
		$translateProvider.useStaticFilesLoader({
			prefix: './editor-app/i18n/',
			suffix: '.json'
		});

		$translateProvider.preferredLanguage('zh');

		// remember language
		$translateProvider.useCookieStorage();

	}])
	.run(['$rootScope', '$timeout', '$modal', '$translate', '$location', '$window', '$http', '$q',
		function ($rootScope, $timeout, $modal, $translate, $location, $window, $http, $q) {

			$rootScope.config = {
				contextRoot: ACTIVITI.CONFIG.getContext().bpmModel
			};

			$rootScope.editorInitialized = false;

			$rootScope.editorFactory = $q.defer();

			$rootScope.forceSelectionRefresh = false;

			$rootScope.ignoreChanges = false; // by default never ignore changes

			$rootScope.validationErrors = [];

			$rootScope.staticIncludeVersion = Date.now();

			/**
			 * A 'safer' apply that avoids concurrent updates (which $apply allows).
			 */
			$rootScope.safeApply = function (fn) {
				var phase = this.$root.$$phase;
				if (phase == '$apply' || phase == '$digest') {
					if (fn && (typeof (fn) === 'function')) {
						fn();
					}
				} else {
					this.$apply(fn);
				}
			};

			function getQueryString(name) {
				var reg = new RegExp("(^|&)" + name + "=([^&]*)(&|$)", "i");
				var r = window.location.search.substr(1).match(reg);
				if (r != null) return unescape(r[2]); return "";
			}

			$rootScope.addNewNodeNum = function (type) {
				var typeNumJson = $rootScope.editor.typeNumJson;
				if (!typeNumJson) {
					typeNumJson = {};
				}
				if (typeNumJson[type]) {
					typeNumJson[type]++;
				} else {
					typeNumJson[type] = 1;
				}
				$rootScope.editor.typeNumJson = typeNumJson;
			};

			$rootScope.$on('editor-resize', function () {
				$timeout(function () {
					if ($rootScope.editor) {
						var w = jQuery("#canvasHelpWrapper").width(),
							h = jQuery("#canvasHelpWrapper").height();
						if (w > 40 && h > 40) {
							$rootScope.editor.getCanvas().setSize({ width: w - 40, height: h - 40 });
						}
					}
				}, 500);
			});

			function initEditor(data) {
				data = data || {
					model: { stencilset: { namespace: "http://b3mn.org/stencilset/bpmn2.0#" } },
					name: "",
					defKey: "",
					desc: "",
					typeId: "",
					typeName: "",
					defId: "",
					reason: "",
					version: ""
				};
				$rootScope.editor = new ORYX.Editor(data);
				$rootScope.$broadcast("editor-resize");
				$rootScope.modelData = angular.fromJson(data);
				$rootScope.editorFactory.resolve();
			}
            /**
             * Initialize the event bus: couple all Oryx events with a dispatch of the
             * event of the event bus. This way, it gets much easier to attach custom logic
             * to any event.
             */
			/* Helper method to fetch model from server (always needed) */
			function fetchModel(modelId) {
				var defId = getQueryString("defId");
				if (!defId) {
					initEditor();
					return;
				}
				var modelUrl = KISBPM.URL.getModel(defId);
				$http({
					method: 'GET',
					url: modelUrl,
					headers: { 'Authorization': KISBPM.URL.getToken },
				}).success(function (data, status, headers, config) {
					if (!data.defId) {
						data = null;
					} else {
						data.model = JSON.parse(data.model);
					}
					initEditor(data);
				}).error(function (data, status, headers, config) {
					console.log('Error loading model with id ' + modelId + ' ' + data);
				});
			}


			function initScrollHandling() {
				var canvasSection = jQuery('#canvasSection');
				canvasSection.scroll(function () {

					// Hides the resizer and quick menu items during scrolling

					var selectedElements = $rootScope.editor.selection;
					var subSelectionElements = $rootScope.editor._subSelection;

					$rootScope.selectedElements = selectedElements;
					$rootScope.subSelectionElements = subSelectionElements;
					if (selectedElements && selectedElements.length > 0) {
						$rootScope.selectedElementBeforeScrolling = selectedElements[0];
					}

					jQuery('.Oryx_button').each(function (i, obj) {
						$rootScope.orginalOryxButtonStyle = obj.style.display;
						obj.style.display = 'none';
					});

					jQuery('.resizer_southeast').each(function (i, obj) {
						$rootScope.orginalResizerSEStyle = obj.style.display;
						obj.style.display = 'none';
					});
					jQuery('.resizer_northwest').each(function (i, obj) {
						$rootScope.orginalResizerNWStyle = obj.style.display;
						obj.style.display = 'none';
					});
					$rootScope.editor.handleEvents({ type: ORYX.CONFIG.EVENT_CANVAS_SCROLL });
				});

				canvasSection.scrollStopped(function () {

					// Puts the quick menu items and resizer back when scroll is stopped.

					$rootScope.editor.setSelection([]); // needed cause it checks for element changes and does nothing if the elements are the same
					$rootScope.editor.setSelection($rootScope.selectedElements, $rootScope.subSelectionElements);
					$rootScope.selectedElements = undefined;
					$rootScope.subSelectionElements = undefined;

					function handleDisplayProperty(obj) {
						if (jQuery(obj).position().top > 0) {
							obj.style.display = 'block';
						} else {
							obj.style.display = 'none';
						}
					}

					jQuery('.Oryx_button').each(function (i, obj) {
						handleDisplayProperty(obj);
					});

					jQuery('.resizer_southeast').each(function (i, obj) {
						handleDisplayProperty(obj);
					});
					jQuery('.resizer_northwest').each(function (i, obj) {
						handleDisplayProperty(obj);
					});

				});
			}

            /**
             * Initialize the Oryx Editor when the content has been loaded
             */
			$rootScope.$on('$includeContentLoaded', function (event) {
				if (!$rootScope.editorInitialized) {
					ORYX._loadPlugins();
					var modelId = EDITOR.UTIL.getParameterByName('modelId');
					fetchModel(modelId);
					jQuery.fn.scrollStopped = function (callback) {
						jQuery(this).scroll(function () {
							var self = this, $this = jQuery(self);
							if ($this.data('scrollTimeout')) {
								clearTimeout($this.data('scrollTimeout'));
							}
							$this.data('scrollTimeout', setTimeout(callback, 50, self));
						});
					};
					// Always needed, cause the DOM element on which the scroll event listeners are attached are changed for every new model
					initScrollHandling();
					$rootScope.editorInitialized = true;
				}
			});

            /**
             * Initialize the event bus: couple all Oryx events with a dispatch of the
             * event of the event bus. This way, it gets much easier to attach custom logic
             * to any event.
             */
			$rootScope.editorFactory.promise.then(function () {

				KISBPM.eventBus.editor = $rootScope.editor;

				var eventMappings = [
					{ oryxType: ORYX.CONFIG.EVENT_SELECTION_CHANGED, kisBpmType: KISBPM.eventBus.EVENT_TYPE_SELECTION_CHANGE },
					{ oryxType: ORYX.CONFIG.EVENT_DBLCLICK, kisBpmType: KISBPM.eventBus.EVENT_TYPE_DOUBLE_CLICK },
					{ oryxType: ORYX.CONFIG.EVENT_MOUSEOUT, kisBpmType: KISBPM.eventBus.EVENT_TYPE_MOUSE_OUT },
					{ oryxType: ORYX.CONFIG.EVENT_MOUSEOVER, kisBpmType: KISBPM.eventBus.EVENT_TYPE_MOUSE_OVER }
				];

				eventMappings.forEach(function (eventMapping) {
					$rootScope.editor.registerOnEvent(eventMapping.oryxType, function (event) {
						KISBPM.eventBus.dispatch(eventMapping.kisBpmType, event);
					});
				});

				$rootScope.editor.registerOnEvent(ORYX.CONFIG.EVENT_SHAPEREMOVED, function (event) {
					var validateButton = document.getElementById(event.shape.resourceId + "-validate-button");
					if (validateButton) {
						validateButton.style.display = 'none';
					}
				});

				// The Oryx canvas is ready (we know since we're in this promise callback) and the
				// event bus is ready. The editor is now ready for use
				KISBPM.eventBus.dispatch(KISBPM.eventBus.EVENT_TYPE_EDITOR_READY, { type: KISBPM.eventBus.EVENT_TYPE_EDITOR_READY });

			});

			// Alerts
			$rootScope.alerts = {
				queue: []
			};

			$rootScope.showAlert = function (alert) {
				if (alert.queue.length > 0) {
					alert.current = alert.queue.shift();
					// Start timout for message-pruning
					alert.timeout = $timeout(function () {
						if (alert.queue.length == 0) {
							alert.current = undefined;
							alert.timeout = undefined;
						} else {
							$rootScope.showAlert(alert);
						}
					}, (alert.current.type == 'error' ? 5000 : 1000));
				} else {
					$rootScope.alerts.current = undefined;
				}
			};

			$rootScope.addAlert = function (message, type) {
				var newAlert = { message: message, type: type };
				if (!$rootScope.alerts.timeout) {
					// Timeout for message queue is not running, start one
					$rootScope.alerts.queue.push(newAlert);
					$rootScope.showAlert($rootScope.alerts);
				} else {
					$rootScope.alerts.queue.push(newAlert);
				}
			};

			$rootScope.dismissAlert = function () {
				if (!$rootScope.alerts.timeout) {
					$rootScope.alerts.current = undefined;
				} else {
					$timeout.cancel($rootScope.alerts.timeout);
					$rootScope.alerts.timeout = undefined;
					$rootScope.showAlert($rootScope.alerts);
				}
			};

			$rootScope.addAlertPromise = function (promise, type) {
				if (promise) {
					promise.then(function (data) {
						$rootScope.addAlert(data, type);
					});
				}
			};

		}
	])

	// Moment-JS date-formatting filter
	.filter('dateformat', function () {
		return function (date, format) {
			if (date) {
				if (format) {
					return moment(date).format(format);
				} else {
					return moment(date).calendar();
				}
			}
			return '';
		};
	});
