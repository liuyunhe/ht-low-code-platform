angular.module('activitiModeler')
	.controller('HtStencilController', ['$rootScope', '$scope', '$http', 'templateService', '$timeout', function ($rootScope, $scope, $http, templateService, $timeout) {
		
		// 检查是否有重复ID的元素
		$scope.checkRepeatNode = function (shapes, nodeKeys, repeatIds) {
			for (var i = 0; i < shapes.length; i++) {
				var overrideid = shapes[i].properties["overrideid"];
				if (overrideid) {
					if (nodeKeys.indexOf(overrideid) > -1) {
						repeatIds.push(overrideid);
					} else {
						nodeKeys.push(overrideid);
					}
				}
				if (shapes[i].childShapes.length > 0) {
					$scope.checkRepeatNode(shapes[i].childShapes, nodeKeys, repeatIds);
				}
			}
		};

		function broadcastMsg(message, state, cb) {
			layer.alert(message, {
				icon: state == "success" ? 1 : state == "fail" ? 2 : 3, title: state == "fail" ? "出错了" : "提示", end: cb
			});
		}

		$scope.message = function (message) {
			broadcastMsg(message, "fail");
		}
		// 选择打开本地存储的文件
		$scope.handleFilesChange = function (files) {
			if (!files || files.length != 1 || files[0].size == 0) {
				return;
			}
			var reader = new FileReader();
			reader.readAsText(files[0]);

			reader.onload = function () {
				let json = JSON.parse(this.result);
				$scope.$root.modelData.model = json;
				$scope.editor.importJSON(json, false);
			};
		}

		$scope.saveModel = function (deploy, successCallback) {
			// 保存或发布前，先对流程图进行校验，成功才继续提交。
			$scope.editor._getPluginFacade().raiseEvent({
				type: ORYX.CONFIG.EVENT_VALIDATE_SHAPE,
				callback: function (result) {
					if (result.success) {
						$scope.doSaveModel(deploy, successCallback);
					}
					else {
						setTimeout(function () {
							broadcastMsg(result.message, "fail");
						}, 10);
					}
				}
			});
		};

		$scope.doSaveModel = function (deploy, successCallback) {
			var modelMetaData = $scope.editor.getModelMetaData();
			// Indicator spinner image
			var json = $scope.editor.getJSON();
			if (json.childShapes.length == 0) {
				broadcastMsg("流程图不能为空", "fail");
				return;
			}
			json.properties["name"] = modelMetaData.name;
			json.properties["process_id"] = modelMetaData.defKey;
			json.properties["documentation"] = modelMetaData.desc;
			var nodeKeys = [];
			var repeatIds = [];


			$scope.checkRepeatNode(json.childShapes, nodeKeys, repeatIds);
			if (repeatIds.length > 0) {
				$scope.editor._getPluginFacade().raiseEvent({
					type: ORYX.CONFIG.EVENT_SHOW_DUPLICATE_SHAPE,
					repeatIds: repeatIds
				});
				setTimeout(function () {
					broadcastMsg("以下节点ID：" + repeatIds.join(',') + " 重复用于多个节点元素，流程图中已经选中这些节点元素，请修改。", "fail");
				}, 10);
				return;
			}

			if (!modelMetaData.typeId) {
				broadcastMsg("请选择一个分类");
				return;
			}

			if (!modelMetaData.name) {
				broadcastMsg("请输入一个流程名称");
				return;
			}
			if (!modelMetaData.defKey) {
				broadcastMsg("请输入一个流程定义KEY");
				return;
			}

			if (!/^([a-zA-Z]|_)\w*$/.test(modelMetaData.defKey.trim())) {
				broadcastMsg("流程Key必须为英文字母或者数字，开头必须是字母或者下划线！");
				return;
			}
			//对流程节点进行自定义验证
			if (!$scope.childNodeVerificat(json.childShapes)) {
				return;
			}
			json = JSON.stringify(json);
			var selection = $scope.editor.getSelection();
			$scope.editor.setSelection([]);

			// Get the serialized svg image source
			var svgClone = $scope.editor.getCanvas().getSVGRepresentation(true);
			$scope.editor.setSelection(selection);
			if ($scope.editor.getCanvas().properties["oryx-showstripableelements"] === false) {
				var stripOutArray = jQuery(svgClone).find(".stripable-element");
				for (var i = stripOutArray.length - 1; i >= 0; i--) {
					stripOutArray[i].remove();
				}
			}

			// Remove all forced stripable elements
			var stripOutArray = jQuery(svgClone).find(".stripable-element-force");
			for (var i = stripOutArray.length - 1; i >= 0; i--) {
				stripOutArray[i].remove();
			}

			// Parse dom to string
			var svgDOM = DataManager.serialize(svgClone);


			var params = {
				isdeploy: deploy ? "true" : "false",
				defaultBpmDefinition: {
					defJson: json,
					name: modelMetaData.name,
					defKey: modelMetaData.defKey,
					desc: modelMetaData.desc,
					typeId: modelMetaData.typeId,
					typeName: modelMetaData.typeName,
					version: modelMetaData.version,
					reason: modelMetaData.reason,
					defId: modelMetaData.defId,
					designer: "WEB"
				}
			};
			var firstStatus = false;
			if (modelMetaData.defId && !deploy) {
				layer.confirm('保存修改可能会影响在途实例，建议发布新版，是否确认保存修改?', {icon: 3, title:'提示'}, function(index){
					//do something
					doSave(modelMetaData ,params, deploy, firstStatus ,successCallback);
					layer.close(index);
				  });
			} else {
				firstStatus = true;
				doSave(modelMetaData ,params, deploy, firstStatus, successCallback);
			}
		
		}

		function doSave(modelMetaData , params, deploy, firstStatus, successCallback ){
			$scope.btnDisable.save = true;
			var index = layer.load(2, { time: 10000 });
			// Update
			$http({
				method: 'post',
				data: params,
				ignoreErrors: true,
				headers: {
					'Accept': 'application/json',
					'Content-Type': 'application/json; charset=UTF-8',
					'Authorization': KISBPM.URL.getToken
				},
				url: KISBPM.URL.putModel(modelMetaData.modelId)
			}).success(function (data, status, headers, config) {
				$scope.btnDisable.save = false;
				if (data && data.state) {
					$scope.editor.handleEvents({
						type: ORYX.CONFIG.EVENT_SAVED
					});
					$scope.modelData.name = modelMetaData.name;
					$scope.modelData.lastUpdated = data.lastUpdated;
					$scope.editor.modelMetaData.defId = data.value;

					// Fire event to all who is listening
					var saveEvent = {
						type: KISBPM.eventBus.EVENT_TYPE_MODEL_SAVED,
						model: params,
						modelId: modelMetaData.modelId,
						eventType: 'update-model'
					};
					KISBPM.eventBus.dispatch(KISBPM.eventBus.EVENT_TYPE_MODEL_SAVED, saveEvent);

					if (successCallback) {
						successCallback();
					}

					if (deploy) {
						broadcastMsg("发布新版成功", 'success', function () {
							window.parent.postMessage({ type: "flowDesignPublishSuccess",id:data.value }, "*");
						});
					} else {
						if(!firstStatus){
							broadcastMsg("保存修改成功", 'success', function () {
								window.parent.postMessage({ type: "flowDesignSaveSuccess" }, "*");
							});
						}else{
							broadcastMsg("保存成功", 'success', function () {
								window.parent.postMessage({ type: "flowDesignSaveSuccess" }, "*");
							});
						}
						
					}
				} else {
					broadcastMsg(data.message, 'fail');
				}
				$scope.btnDisable.save = false;
			}).error(function (data, status, headers, config) {
				if (data.shortMessage || data.error) {
					broadcastMsg(data.shortMessage ? data.shortMessage : data.error, 'fail');
				} else {
					broadcastMsg("无法连接到服务器", 'fail');
				}
				$scope.btnDisable.save = false;
			}).finally(function () {
				layer.close(index);
			});
		}

		$scope.selectType = function () {
			layer.ready(function () {
				templateService.get('editor-app/popups/select-type.html?version=' + Date.now(), $scope).then(function (target) {
					layer.open({
						type: 1,
						title: "选择分类",
						area: ['300px', '340px'],
						btn: ['确定', '取消'],
						yes: function (index, layerno) {
							var layerScope = layerno.find("[ng-controller='KisBpmShapeSelectionTypeCtrl']").scope();
							layerScope.$apply(function () {
								var donotClose = layerScope.select();
								if (!donotClose) {
									layer.close(index);
								}
							});
						},
						fixed: false, //不固定
						maxmin: false,
						content: target
					});
				});
			});
		};

		$rootScope.setShapeProperty = function (name, value, shape) {
			if (!shape) {
				shape = $scope.selectedShape;
			}
			$rootScope.forceSelectionRefresh = true;
			shape.setProperty(name, value);
			var facade = shape.facade;
			facade.setSelection([shape]);
			facade.getCanvas().update();
			facade.updateSelection();
		};

		$rootScope.addNewNodeNum = function (type) {
			var typeNumJson = $rootScope.stencilIdNumber;
			if (!typeNumJson) {
				typeNumJson = {};
			}
			if (typeNumJson[type]) {
				typeNumJson[type]++;
			} else {
				// 打开已有流程进行编辑器时，要从现有流程图中获取当前分类的最大ID编号				
				typeNumJson[type] = $scope.editor.getLoadedPluginByName("ORYX.Plugins.HtPlugins").getMaxNumberOfType(type);
			}
			$rootScope.stencilIdNumber = typeNumJson;
		};
		//对流程节点进行自定义验证
		$scope.childNodeVerificat = function (childs) {
			var unSuitableNames = [];
			var reg = /^[0-9a-zA-Z_]{1,}$/i;
			//检测外部子流程是否选择  ^[0-9a-zA-Z_]{1,}$
			for (var i = 0; i < childs.length; i++) {
				var obj = childs[i];
				if (obj.properties) {
					var properties = obj.properties;
					if (properties.overrideid && !reg.test(properties.overrideid)) {
						unSuitableNames.push(properties.name);
					}
					if (properties['ismultiinstance']) {
						if (properties.hasOwnProperty('callactivitycalledelement') && !properties['callactivitycalledelement']) {
							alert("节点“" + properties['name'] + "”的key不能为空，请选择！");
							return false;
						}
					}
				}
			}
			if (unSuitableNames.length > 0) {
				alert("节点“" + unSuitableNames.join(',')+ "”的节点ID不规范，只能包含数组,字母,下划线！");
				return false;
			}
			return true;
		};
	}]);
