/*
 * 选择一个流程分类
 */

var KisBpmShapeSelectionCallactivityTypeCtrl = ['$rootScope', '$scope', '$timeout', '$translate', '$http', function ($rootScope, $scope, $timeout, $translate, $http) {

    $scope.selectedSubDefKeys = [];

    $scope.select = function () {
        if ($scope.selectedSubDefKeys.length > 0) {
            var subDef = $scope.selectedSubDefKeys[0];
            var defKey = subDef["defKey"];
            var selectedShape = $rootScope.editor.getSelection().first();
            $rootScope.setShapeProperty("oryx-callactivitycalledelement", defKey, selectedShape);
        }
    };

    var initZtree = function () {
        var baseUrl = ACTIVITI.CONFIG.getContext().portal;
        var ztreeCreator = new ZtreeCreator('type__Tree_', baseUrl + "/sys/sysType/v1/getTypesByKey?typeKey=FLOW_TYPE")
            .setCallback({ onClick: selectType })
            .initZtree({ reqMethod: "get" }, function (treeObj) {
                _treeObj = treeObj;
            });
        new ZtreeCreator('type__Tree_', baseUrl + "/sys/sysType/v1/getTypesByKey")
            .setCallback({ onClick: selectType })
            .initZtree({ typeKey: "FLOW_TYPE" }, function (treeObj) { });
    };

    var selectType = function (event, treeId, treeNode) {
        $http({ method: 'GET', headers: { 'Authorization': KISBPM.URL.getToken }, url: ACTIVITI.CONFIG.getContext().bpmModel + "/flow/def/v1/getByTypeId?typeId=" + treeNode.id }).
            success(function (data, status, headers, config) {
                if (data.rows) {
                    $scope.availableMorphShapes = data.rows;
                }
            }).
            error(function (data, status, headers, config) {
                alert("无法连接到服务器");
            });
    };

    //$scope.property.value = '';
    var loadDefList = function () {
        $scope.gridOptions = {
            data: 'availableMorphShapes',
            enableRowReordering: true,
            headerRowHeight: 28,
            multiSelect: false,
            keepLastSelected: false,
            selectedItems: $scope.selectedSubDefKeys,
            columnDefs: [{ field: 'name', displayName: '流程名称' },
            { field: 'defKey', displayName: '流程KEY' }]
        };
    };
    initZtree();
    loadDefList();
}];