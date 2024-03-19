Array.prototype.remove = function(val) {
    for (var i = 0; i < this.length; i++) {
        if (this[i] === val) {
            this.splice(i, 1);
            i--;
        }
    }
    return this;
}

angular.module('components', ['base64'])
	.service('validService',[function(){
		return {
			validate:function(ngForm){
	        	//如果未传入表单对象，则返回验证成功
	        	if(!ngForm) return true;
	        	//触发验证
	        	ngForm.$setValidity();
	        	return ngForm.$valid;
	        }};
	}])
	.directive('htBindHtml', ['$compile','$base64',function($compile,$base64) {
		return {
			restrict : 'A',
			link : function(scope, elm, attrs) {
				scope.unbindWatch = scope.$watch(attrs.htBindHtml, function(newVal, oldVal) {
	                if (!elm.data('unbindWatchTag')) {
	                    if(newVal){
	                        elm.data('unbindWatchTag',true);
	                        if(attrs.base64){
	                        	elm.html($base64.decode(newVal));
	                        }
	                        else{
	                        	elm.html(newVal);
	                        }
	                        scope.htmlFn&&scope.htmlFn.call();
	                        $compile(elm.contents())(scope);
	                    }
	                    else{
	                        //避免重复添加监视
	                        elm.data('unbindWatchTag')&&scope.unbindWatch();
	                    }
	                }
	            });
			}
		};
	}])
    .directive('tabs', function() {
        return {
            restrict: 'EAC',
            transclude: true,
            scope: {},
            controller: function($scope, $element) {
                var panes = $scope.panes = [];

                $scope.select = function(pane) {
                    angular.forEach(panes, function(pane) {
                        pane.selected = false;
                    });
                    pane.selected = true;
                }

                this.addPane = function(pane) {
                    if (panes.length == 0) $scope.select(pane);
                    panes.push(pane);
                }
            },
            template: '<div class="tabbable">' + '<ul class="nav nav-tabs">' + '<li ng-repeat="pane in panes" ng-class="{active:pane.selected}">' + '<a href="" ng-click="select(pane)">{{pane.title}}</a>' + '</li>' + '</ul>' + '<div class="tab-content" ng-transclude></div>' + '</div>',
            replace: true
        };
    })
    .directive('pane', function() {
        return {
            require: '^tabs',
            restrict: 'EAC',
            transclude: true,
            scope: {
                title: '@'
            },
            link: function(scope, element, attrs, tabsCtrl) {
                tabsCtrl.addPane(scope);
            },
            template: '<div class="tab-pane" ng-class="{active: selected}" ng-transclude>' + '</div>',
            replace: true
        };
    })
    .directive('checkbox', function() {
	    return {
	        restrict: 'A',
	        require:'?ngModel',
	        link: function(scope, element, attrs, ngModel) {
	        	if(!ngModel)return;
	        	//解决checkbox元素中ngModel的值初始化时不会 勾选复选框的问题
	        	ngModel.$render = function(){
	        		var hasTrueVal = !ngModel.$isEmpty(attrs.ngTrueValue),
	        			r = ngModel.$modelValue;
	        		
	        		hasTrueVal&&(r = ngModel.$modelValue==attrs.ngTrueValue?true:false);
	        		element[0].checked = r;
	        	}
	        }
	    };
	}).directive('select2',["$timeout",function($timeout){
	    return {
	        restrict: 'EA',
	        scope:{
	        	select2Data:'='
	        },
	        require: '?ngModel',
	        link: function (scope, element, attrs, ctrl) {
	        	if (!ctrl) return;
	        	var $element = $(element);

	        	function formatState(state) {
	        	    if (!state.id) {
	        	        return state.text;
	        	    }
	        	    var $state = $(
	        	    	'<b>' + state.text + '</b><span style="margin-left:20px;">' + state.id + '</span>'
	        	    );
	        	    return $state;
	        	};

	        	scope.$watch("select2Data", function(newVal, oldVal) {
	        	    if (newVal !== oldVal || !$element.data("select2Inited")) {
	        	        $element.data("select2Inited", true);
	        	        $element.select2({
	        	            data: newVal,
	        	            templateResult:formatState
	        	        });
	        	    }
	        	}, false);

	        	ctrl.$formatters.unshift(function(value) {
	        	    $timeout(function() {
	        	        $element.val(value).trigger("change");
	        	    }, 0);
	        	    return value;
	        	});
	        }
	    }
	}]).directive('htValid', ["$compile",function($compile) {
        return {
            restrict: 'EA',
            scope: {
                htValid: '='
            },
            require: '?ngModel',
            link: function(scope, element, attrs, ctrl) {
                if (!ctrl || !angular.isArray(scope.htValid) || scope.htValid.length == 0) return;
                
                //添加验证错误信息控件
                if(attrs.name){
                	var formObj = $(element).parents("[ng-form]");
                	if(formObj){
                		var formName = formObj.attr("name")||formObj.attr("ng-form"),
                			br = $('<br />'),
                			elementPath = formName + "." + attrs.name,
                			span = $('<span class="red"></span>');
                	
	                	span.attr("ng-show", elementPath + ".$error");
	                	span.html("{{"+elementPath+".$message}}");
	                	$(element).after(br);
	                	br.after(span);
	                	$compile(span.contents())(scope.$parent);
                	}
                }
                
                function validate(viewValue) {
                    var spiritAry = [],
                        lastResult = null,
                        hanlde = function(result) {
                            //已遍历所有规则 或 验证失败
                            if (!this.item || !result.result) {
                                lastResult = result;
                                return;
                            } else {
                                //预置验证规则的别名
                                if (angular.isString(this.item)) {
                                    result = CustomValidRules.validate(this.item, viewValue);
                                }
                                //验证方法
                                if (angular.isFunction(this.item)) {

                                }
                                //责任链传递
                                CustomValidRules.Handler.prototype.handle.call(this, result); 
                            }
                        };
                    angular.forEach(scope.htValid, function(item, index) {
                        var spirit;
                        if (index == 0) {
                            spirit = new CustomValidRules.Handler({
                                handle: hanlde
                            }, item);
                        } else {
                            spirit = new CustomValidRules.Handler(spiritAry[index - 1], item);
                        }
                        spirit.handle = hanlde;
                        spiritAry[index] = spirit;
                    });
                    spiritAry.pop().handle({
                        result: true
                    });
                    if(lastResult.result){
                    	ctrl.$setValidity("htValid", true);
                    	ctrl.$message = undefined;
                    	return viewValue;
                    }
                    else{
                    	ctrl.$setValidity("htValid", false);
                    	ctrl.$message = lastResult.message;
                    	return undefined;
                    }
                }
                ctrl.$parsers.unshift(validate);
            }
        }
    }]);