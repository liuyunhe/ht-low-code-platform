<template>
  <div
    @click.capture="handleSelectWidget(index)"
    class="widget-subtable"
    :class="{active: selectWidget.key == element.key}"
  >
    <div class="drag-widget" title="拖拽" v-if="selectWidget.key == element.key">
      <i class="icon-drag"></i>
    </div>
    <div class="widget-view-action" v-if="selectWidget.key == element.key">
      <i class="icon-trash" title="删除" @click.stop="handleWidgetDelete(index)"></i>
    </div>
    <div style="overflow-x: auto; overflow-y: hidden; padding: 15px;">
      <div v-if="element.options.showLabel" style="font-weight:bold;padding:10px;">{{element.desc_zh || element.desc}}</div>
      <table class="el-form--label-top" style="padding-bottom:10px;width: 100%;">
        <draggable
          v-model="element.list"
          :no-transition-on-drag="true"
          v-bind="{group:'form', ghostClass: 'ghost', animation: 200, handle: '.drag-widget'}"
          @end="handleMoveEnd"
          @start="handleMoveStart"
          @add="handleWidgetColAdd($event, element)"
        >
          <transition-group name="fade" tag="div" class="widget-col-list">
            <div
              v-for="(child, i) in element.list.filter(c => c.key)"
              :key="child.key"
              :class="{active: selectWidget.key == child.key}"
            >
              <widget-form-item
                :key="child.key"
                :element="child"
                :index="i"
                :selectWidgetList.sync="selectWidgetList"
                :select.sync="selectWidget"
                :data.sync="element"
                style="width: 100%;"
              />
            </div>
          </transition-group>
        </draggable>
      </table>
    </div>
  </div>
</template>
<script>
import Draggable from "vuedraggable";
import WidgetFormItem from "@/components/form/WidgetFormItem.vue";
import  controlsApi from "@/api/controlsConfig.js";
import deepmerge from "deepmerge";
export default {
  name: "widget-suntable-layout",
  components: { Draggable, WidgetFormItem },
  props: ["element", "select", "index", "data","selectWidgetList"],
  data() {
    return {
      selectWidget: this.select
    };
  },
  methods: {
    handleMoveStart: function(evt) {
      // 新增控件时  将控件属性切断联系
      evt.item._underlying_vm_ = deepmerge({}, evt.item._underlying_vm_, {
        clone: true
      });
      const key =
        Date.parse(new Date()) + "_" + Math.ceil(Math.random() * 99999);
      evt.item._underlying_vm_.key = key;
    },
    handleSelectWidget(index) {
      this.selectWidget = this.data.list[index];
    },
    handleMoveEnd({ newIndex, oldIndex }) {
      console.log("index", newIndex, oldIndex);
    },
    handleWidgetColAdd($event, element) {
      const newIndex = $event.newIndex;
      const oldIndex = $event.oldIndex;
      const item = $event.item;
      if(item.innerText=="二维码"){
        this.$message.warning("孙表不允许存在二维码");
        element.list.splice(newIndex, 1);
        return false;
      }
      if(item.innerText=="里程碑"){
        this.$message.warning("孙表不允许存在里程碑");
        element.list.splice(newIndex, 1);
        return false;
      }
      if (item.innerText == "表格布局") {
        this.$message.warning("孙表不允许存在表格布局");
        element.list.splice(newIndex, 1);
        return false;
      }
      if (item.innerText == "高德地图") {
        this.$message.warning("孙表不允许存在高德地图");
        element.list.splice(newIndex, 1);
        return false;
      }
      if(item.innerText=="相关流程"){
        this.$message.warning("孙表不允许存在相关流程");
        element.list.splice(newIndex, 1);
        return false;
      }
      if (item.innerText === "数据视图"){
        this.$message.warning("孙表不允许存在数据视图");
        element.list.splice(newIndex, 1);
        return false;
      }
      if (!controlsApi.handleLayoutComponents(this, element, element.list, newIndex)) {
        return;
      }
      if(!element.options.boSubEntity){
        this.$message.warning("请先绑定孙表");
        return false;
      }
      // 防止布局元素的嵌套拖拽
      if (item.isLayout) {
        element.list.list.splice(newIndex, 1);
        return false;
      }
      this.selectWidget = element.list[newIndex];
      this.selectWidget.parentNodeType = "sun";
      this.selectWidget.boSubEntity  = element.options.boSubEntity;
    },
    handleWidgetDelete(index) {
      if (this.data.list.length - 1 === index) {
        if (index === 0) {
          this.selectWidget = { options: { validateType: "" } };
        } else {
          this.selectWidget = this.data.list[index - 1];
        }
      } else {
        this.selectWidget = this.data.list[index + 1];
      }

      this.$nextTick(() => {
        this.data.list.splice(index, 1);
      });
    }
  },
  watch: {
    select(val) {
      this.selectWidget = val;
    },
    selectWidget: {
      handler(val,oldVal) {
        this.$emit("update:select", val);
      },
      deep: true
    }
  }
};
</script>
<style lang="scss" scoped>
@import "@/assets/css/form-editor.scss";

.widget-subtable {
  padding-bottom: 0;
  padding: 10px 5px;
  position: relative;
  min-width: 420px;
}

.widget-subtable.active {
  outline: 1px solid #e6a23c !important;
}

.widget-subtable:hover {
  outline: 1px dashed #ccc;
}

div.widget-view-action {
  border-color: #e6a23c;
  border-radius: 15px;
}

div.widget-view-action i.icon-trash {
  margin: 0 10px;
}

div.drag-widget {
  border-color: #e6a23c;
}

div.drag-widget i.icon-drag {
  color: #e6a23c;
}

.widget-col-list {
  min-height: 50px;
  outline: 1px solid #ededed;
  display: -webkit-box;
  display: -ms-flexbox;
  display: flex;
  -webkit-box-align: center;
  -ms-flex-align: center;
  align-items: center;
}

.widget-col-list .widget-form-item {
  margin: 0;
  outline: 1px solid #ededed;
  height: 100%;
}

>>> .ht-form-item {
  text-align: center;
  padding: 0;
  margin: 0;
}

>>> .el-form-item__label {
  font-weight: bold;
  min-width: 120px;
  padding: 0;
  text-align: center;
}

>>> .el-form-item__label:after {
  visibility: hidden;
}

>>> .el-form-item__content {
  border-top: 1px solid #ededed;
  padding: 10px;
  height: 50px;
  margin-left: 0px !important;
}
</style>
