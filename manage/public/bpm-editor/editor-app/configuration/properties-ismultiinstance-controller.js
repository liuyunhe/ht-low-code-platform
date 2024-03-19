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

var IsmultiinstanceCtrl = [ '$scope','$rootScope', function($scope,$rootScope) {

	if ($scope.property.value == undefined && $scope.property.value == null)
    {
    	$scope.property.value = '单实例';
    }
        
    $scope.ismultiinstanceChanged = function() {
    	if($scope.property.value == '单实例' && $scope.selectedShape){
    		var shape = $scope.selectedShape;
    		shape.properties['oryx-multiinstance_type'] = 'Sequential';
    	}
    	$rootScope.forceSelectionRefresh = true;
    	$scope.updatePropertyInModel($scope.property);
    	var selectedShape = $scope.selectedShape;
    	var facade = selectedShape.facade;
    	facade.setSelection([selectedShape]);
    	facade.getCanvas().update();
    	facade.updateSelection();
    };
}];