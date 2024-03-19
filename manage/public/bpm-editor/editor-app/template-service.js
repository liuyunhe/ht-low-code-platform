var base = angular.module("hotentTemplate", []);

/**
 * 提供模板的加载和编译功能
 */
base.service('templateService', ['$http', '$q', '$compile', '$rootScope', function($http, $q, $compile, $rootScope) {
    var service = {
    		get: function(templateUrl,scope){
    			var def = $q.defer();
    			$http.get(templateUrl).then(function(response){
					var layerDialog = angular.element("#layerDialog");
					if(!layerDialog || layerDialog.length==0){
						var main = angular.element("#main"),
							layerDialog = angular.element('<div id="layerDialog"></div>');
						main.append(layerDialog);
					}
					layerDialog.html(response.data);
					$compile(layerDialog.contents())(scope || $rootScope);
					def.resolve(layerDialog);
				});
    			return def.promise;
    		}
        }
    return service;
}]);