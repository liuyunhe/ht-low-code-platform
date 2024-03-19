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
      <el-form label-position="top" style="padding-bottom:10px">
        <draggable
          v-model="element.list"
          :no-transition-on-drag="true"
          v-bind="{group:'form', ghostClass: 'ghost', animation: 200, handle: '.drag-widget'}"
          @end="handleMoveEnd"
          @start="handleMoveStart"
          @add="handleWidgetColAdd($event, element)"
        >
          <transition-group name="fade" tag="div" class="widget-col-list">
            
          </transition-group>
        </draggable>
      </el-form>
    </div>
  </div>
</template>
<script>
import Draggable from "vuedraggable";
import WidgetFormItem from "@/components/form/WidgetFormItem.vue";
import controlsApi from "@/api/controlsConfig.js";
import deepmerge from "deepmerge";

export default {
  name: "widget-data-view-layout",
  components: { 
    Draggable, 
    WidgetFormItem 
  },
  props: ["element", "select", "index", "data"],
  data() {
    return {
      selectWidget: this.select,
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
      if (!controlsApi.handleLayoutComponents(this)) {
        return;
      }
      this.$message.error("数据视图控件无法加入其它控件!");
      return false;
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
}
</style>