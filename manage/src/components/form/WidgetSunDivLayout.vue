<template>
  <div
    @click.capture="handleSelectWidget(index)"
    class="widget-subtable"
    :class="{active: selectWidget.key == element.key}"
  >
    <div
      class="drag-widget"
      title="拖拽"
      v-if="selectWidget.key == element.key"
    >
      <i class="icon-drag"></i>
    </div>
    <div class="widget-view-action" v-if="selectWidget.key == element.key">
      <i
        class="icon-trash"
        title="删除"
        @click.stop="handleWidgetDelete(index)"
      ></i>
    </div>
    <div style="overflow-x: auto; overflow-y: hidden; padding: 15px;">
      <div
        v-if="element.options.showLabel"
        style="font-weight:bold;padding:10px;"
      >
        {{ element.desc_zh || element.desc }}
      </div>
      <el-row
        class="widget-col"
        v-show="element && element.key"
        type="flex"
        :class="{ active: selectWidget.key == element.key }"
        :gutter="element.options.gutter ? element.options.gutter : 0"
        :justify="element.options.justify"
        :align="element.options.align"
      >
        <el-col :span="24">
          <draggable
            v-model="element.list"
            :no-transition-on-drag="true"
            v-bind="{
              group: 'form',
              ghostClass: 'ghost',
              animation: 200,
              handle: '.drag-widget'
            }"
            @end="handleMoveEnd($event, element)"
            @start="handleMoveStart"
            @add="handleWidgetColAdd($event, element)"
          >
            <transition-group name="fade" tag="div" class="widget-col-list">
              <template v-for="(child, i) in (element.list.filter(c => c.key))">
                <widget-grid-layout
                  v-if="child.ctrlType == 'grid'"
                  :key="child.key"
                  :element="child"
                  :index="i"
                  :selectWidgetList.sync="selectWidgetList"
                  :select.sync="selectWidget"
                  :data.sync="element"
                />
                <widget-form-item
                  v-else
                  :key="child.key"
                  :element="child"
                  :index="i"
                  :selectWidgetList.sync="selectWidgetList"
                  :select.sync="selectWidget"
                  :data.sync="element"
                />
              </template>
            </transition-group>
          </draggable>
        </el-col>
      </el-row>
    </div>
  </div>
</template>
<script>
import Draggable from "vuedraggable";
import WidgetFormItem from "@/components/form/WidgetFormItem.vue";
import WidgetGridLayout from "@/components/form/WidgetGridLayout.vue";
import controlsApi from "@/api/controlsConfig.js";
import deepmerge from "deepmerge";
export default {
  name: "widget-sundiv-layout",
  components: { Draggable, WidgetFormItem, WidgetGridLayout },
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
    handleMoveEnd: function(evt,element) {
      if(evt.to.__vue__){
        if(evt.item._underlying_vm_.parentNodeType== "sun" && 
          element.name==evt.item._underlying_vm_.boSubEntity){
          //孙表栅格布局放入到主表内，绑定是子表字段问题
          evt.item._underlying_vm_.boSubEntity ="";
          evt.item._underlying_vm_.parentNodeType ="";
          evt.item._underlying_vm_.parentType ="";
        }
      }
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
      if(this.isLayoutComponents(item.innerText)){
        this.$message.warning("布局字段中不允许再拖入布局字段");
        element.list.splice(newIndex, 1);
        return false;
      }
      if (!controlsApi.handleLayoutComponents(this, element, element.list, newIndex)) {
        return;
      }
      if (!element.options.boSubEntity) {
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
      this.selectWidget.boSubEntity = element.options.boSubEntity;
    },
    isLayoutComponents(type) {
      if (
        type == "tab布局" ||
        type == "分页布局" ||
        type == "折叠面板" ||
        type == "子表" ||
        type == "div子表" ||
        type == "孙表" ||
        type == "div孙表"
      ) {
        return true;
      }
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
      handler(val, oldVal) {
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
.widget-col {
  padding-bottom: 0;
  padding: 15px 5px;
}

.el-col {
  min-height: 50px;
}

.widget-col-list {
  min-height: 50px;
  border: 1px solid #ededed;
}

div.widget-view-action i.icon-trash {
  margin: 0 10px;
}
</style>
