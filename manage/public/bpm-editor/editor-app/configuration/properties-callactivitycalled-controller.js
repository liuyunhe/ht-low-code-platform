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

/*
 * Execution listeners
 */

var CallactivitycalledCtrl = [ '$scope','$rootScope', 'templateService', function($scope,$rootScope,templateService) {

	if ($scope.property.value == undefined && $scope.property.value == null)
    {
    	$scope.property.value = '单实例';
    }
    
	$scope.selectSubDef = function(){
		templateService.get('editor-app/popups/select-callactivity.html?version=' + Date.now(), $scope).then(function(target){
			layer.open({
				  type: 1,
				  title:"选择子流程",
				  area: ['600px', '330px'],
				  btn:['确定','取消'],
				  yes:function(index,layerno){
					layerno.find("[ng-controller='KisBpmShapeSelectionCallactivityTypeCtrl']").scope().select();
					layer.close(index);
				  },
				  fixed: false, //不固定
				  maxmin: true,
				  content: target
				});
		});
	}
}];