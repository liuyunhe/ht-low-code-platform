if (!ORYX.Plugins)
	ORYX.Plugins = new Object();

// 修改日志级别为Error
if (ORYX_LOGLEVEL) {
	ORYX_LOGLEVEL = 1;
}

ORYX.Plugins.HtPlugins = Clazz.extend({
	facade: undefined,
	construct: function (facade) {
		this.facade = facade;
		this._mouseDrag4Pan = {
			draging: false,
			x: 0,
			y: 0,
			target: jQuery("#canvasSection")
		};
		this._canAddDocker = false;
		document.documentElement.addEventListener(ORYX.CONFIG.EVENT_MOUSEWHEEL, this.mouseWheel4ZoomWhenAlt.bind(this), true);
		document.documentElement.addEventListener(ORYX.CONFIG.EVENT_MOUSEMOVE, this.mouseDrag4PanWhenAltMove.bind(this), true);
		document.documentElement.addEventListener(ORYX.CONFIG.EVENT_MOUSEUP, this.mouseDrag4PanWhenAltEnd.bind(this), true);
		this.facade.registerOnEvent(ORYX.CONFIG.EVENT_MOUSEDOWN, this.mouseDownWhenAlt.bind(this));
		this.facade.registerOnEvent(ORYX.CONFIG.EVENT_DBLCLICK, this.mouseOver4RemoveDockerWhenAlt.bind(this));
		this.facade.registerOnEvent(ORYX.CONFIG.EVENT_SHOW_DUPLICATE_SHAPE, this.showShapeWithDuplicateId.bind(this));
		this.facade.registerOnEvent(ORYX.CONFIG.EVENT_VALIDATE_SHAPE, this.validateEachShape.bind(this));
	},
	// 按住Alt鼠标滚轴放大/缩小画布
	mouseWheel4ZoomWhenAlt: function (e) {
		if (!e || !e.altKey) {
			return;
		}
		var viewPlugin = this.facade.getLoadedPluginByName("ORYX.Plugins.View");
		if (e.wheelDelta > 0) {
			viewPlugin.zoom([1.0 + ORYX.CONFIG.ZOOM_OFFSET]);
		}
		else {
			viewPlugin.zoom([1.0 - ORYX.CONFIG.ZOOM_OFFSET]);
		}
	},
	// 按住alt键鼠标左键按下
	mouseDownWhenAlt: function (e, t) {
		if (!e || !e.altKey || !t || !t.properties) {
			return;
		}
		// 点击的对象为线条时，添加一个拐点。
		if (e.target && e.target.tagName == 'path') {
			var dockerPlugin = this.facade.getLoadedPluginByName("ORYX.Plugins.AddDocker");
			dockerPlugin.setEnableAdd(true);
			dockerPlugin.setEnableRemove(false);
			dockerPlugin.handleMouseDown(e, t);
		}
		else {
			// 按住Alt鼠标左键按下，拖拽移动画布开始
			this._mouseDrag4Pan = {
				draging: true,
				x: e.x,
				y: e.y
			};
		}
	},
	// 按住Alt鼠标拖拽画布
	mouseDrag4PanWhenAltMove: function (e) {
		if (!e || !e.altKey || !this._mouseDrag4Pan.draging) {
			return;
		}
		var offsetX = e.x - this._mouseDrag4Pan.x,
			offsetY = e.y - this._mouseDrag4Pan.y;
		if (!this._mouseDrag4Pan.target || this._mouseDrag4Pan.target.length == 0) {
			this._mouseDrag4Pan.target = jQuery("#canvasSection");
		}
		if (this._mouseDrag4Pan.target) {
			var st = this._mouseDrag4Pan.target.scrollTop(),
				sl = this._mouseDrag4Pan.target.scrollLeft();
			this._mouseDrag4Pan.target.scrollTop(st - offsetY);
			this._mouseDrag4Pan.target.scrollLeft(sl - offsetX);
		}
		this._mouseDrag4Pan.x = e.x;
		this._mouseDrag4Pan.y = e.y;
		Event.stop(e);
	},
	// 鼠标拖拽画布结束
	mouseDrag4PanWhenAltEnd: function (e) {
		this._mouseDrag4Pan = {
			draging: false,
			x: 0,
			y: 0
		};
	},
	// 双击拐点可删除它	
	mouseOver4RemoveDockerWhenAlt: function (e, t) {
		if (e.target.tagName != 'circle') {
			return;
		}
		var dockerPlugin = this.facade.getLoadedPluginByName("ORYX.Plugins.AddDocker");
		dockerPlugin.setEnableRemove(true);
		dockerPlugin.setEnableAdd(false);
		dockerPlugin.handleMouseDown(e, t);
		Event.stop(e);
	},
	// 选中具有重复ID的元素
	showShapeWithDuplicateId: function (params) {
		var repeatShapes = [];
		this.facade.getCanvas().getChildShapes(true).each(function (shape) {
			var overrideId = shape.properties["oryx-overrideid"];
			if (overrideId && params.repeatIds.indexOf(overrideId) > -1) {
				repeatShapes.push(shape);
			}
		});
		this.facade.setSelection(repeatShapes);
		this.facade.getLoadedPluginByName("ORYX.Plugins.View").setAFixZoomLevel(1);
	},
	// 校验流程图
	validateEachShape: function (params) {
		var validateFails = [], messageAry = [];
		// 规则 #1：检测流程图中的元素是否均有incoming和outgoing（StartEvent可以只有outgoing，EndEvent可以只有incoming）
		this.facade.getCanvas().getChildShapes(true).each(function (shape) {
			if (shape instanceof ORYX.Core.Node || shape instanceof ORYX.Core.Edge) {
				if (shape.incoming.length == 0 || shape.outgoing.length == 0) {
					var stencilId = shape.getStencil().idWithoutNs();
					// StartEvent可以只有outgoing
					if (stencilId == "StartEvent" && shape.incoming.length == 0 && shape.outgoing.length > 0) {
						return true;
					}
					// EndEvent可以只有incoming
					else if (stencilId == "EndEvent" && shape.incoming.length > 0 && shape.outgoing.length == 0) {
						return true;
					}
					// 泳池、泳道例外
					else if (stencilId == "Pool" || stencilId == "Lane") {
						return true;
					}
					else {
						validateFails.push(shape);
					}
				}
			}
		});
		if (validateFails.length > 0) {
			messageAry.push("流程图中有节点元素未正确的连线，已经自动选中这些节点元素，请修改。");
		}

		// 规则 #2：检验是否存在有线条连接两个完全一样的元素
		var sequenceFlowHash = [], size = validateFails.length;
		this.facade.getCanvas().getChildShapes(true).each(function (shape) {
			// 线条类型的元素
			if (shape instanceof ORYX.Core.Edge && shape.getStencil().idWithoutNs() == 'SequenceFlow') {
				if (shape.incoming.length > 0 && shape.outgoing.length > 0) {
					var incomingOVID = shape.incoming.first().properties['oryx-overrideid'],
						outgoingOVID = shape.outgoing.first().properties['oryx-overrideid'];
					if (incomingOVID && outgoingOVID) {
						if (sequenceFlowHash.indexOf(incomingOVID + outgoingOVID) > -1) {
							validateFails.push(shape);
						}
						else {
							sequenceFlowHash.push(incomingOVID + outgoingOVID);
						}
					}
				}
			}
		});
		if (validateFails.length > size) {
			messageAry.push("流程图中有线条重复的连接到两个相同的元素上了，已经自动选中这些线条，请修改。");
		}

		if (validateFails.length > 0) {
			this.facade.setSelection(validateFails);
			this.facade.getLoadedPluginByName("ORYX.Plugins.View").setAFixZoomLevel(1);
		}

		if (params && params.callback && typeof params.callback == 'function') {
			params.callback({ success: validateFails.length == 0, message: messageAry.join("\n") });
		}
	},
	// 获取某一类元素当前流程图中最大的ID编号
	getMaxNumberOfType: function (type) {
		var max = 0;
		this.facade.getCanvas().getChildShapes(true).each(function (shape) {
			if (shape.getStencil().idWithoutNs() == type) {
				var overrideid = shape.properties['oryx-overrideid'];
				if (overrideid) {
					var match = overrideid.match(/^.*?(\d+)$/);
					if (match) {
						var n = Number.parseInt(match[1]);
						if (n > max) {
							max = n;
						}
					}
				}
			}
		});
		return max + 1;
	}
});