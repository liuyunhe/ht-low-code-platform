/*
 * 选择一个流程分类
 */

var KisBpmShapeSelectionTypeCtrl = ['$rootScope', '$scope', '$timeout', '$translate', function ($rootScope, $scope, $timeout, $translate) {

	$scope.selectedMorphShapes = [];
	$scope.availableMorphShapes = [];
	window._treeObj = null;
	var tempTypeId = "";
	var tempTypeName = ""

	$scope.select = function () {
		if (tempTypeId) {
			$scope.modelData.typeId = tempTypeId;
			$scope.modelData.typeName = tempTypeName;
		}
		else {
			alert("需要选择一个分类");
			return true;
		}
	}
	var setTypeId = function (event, treeId, treeNode) {
		if (!treeNode.getParentNode()) {
			tempTypeId = tempTypeName = "";
			_treeObj.cancelSelectedNode(treeNode);
			return;
		}
		tempTypeId = treeNode.id;
		tempTypeName = treeNode.name;
	}

	var initZtree = function () {
		var ztreeCreator = new ZtreeCreator('type__Tree_', ACTIVITI.CONFIG.getContext().portal + "/sys/sysType/v1/getTypesByKey?typeKey=FLOW_TYPE")
			.setCallback({ onClick: setTypeId })
			.initZtree({ reqMethod: "get" }, function (treeObj) {
				_treeObj = treeObj;
			});
	}
	initZtree();
}];