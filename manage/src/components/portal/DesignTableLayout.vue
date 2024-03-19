<template>
  <div class="widget-form-item" @click.capture="handleSelectWidget(index)">
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
    <el-tabs
      class="widget-col"
      v-if="element && element.key"
      :class="{ active: selectWidget.key == element.key }"
      :v-model="activeName"
      :justify="element.options.justify"
      :tab-position="element.options.align"
      :type="element.options.ctrlType"
    >
      <el-tab-pane
        v-for="(col, colIndex) in element.columns"
        :key="colIndex"
        :name="colIndex + ''"
      >
        <template slot="label">
          <el-tooltip class="item" v-if="col.span.length > 10" effect="dark" :content="col.span" placement="top-start">
            <a>{{col.span.substring(0,10)}}</a>
          </el-tooltip>
          <span v-else>{{col.span}}</span>
        </template>
        <draggable
          v-model="col.list"
          :no-transition-on-drag="true"
          v-bind="{
            group: 'form',
            ghostClass: 'ghost',
            animation: 200,
            handle: '.drag-widget'
          }"
          @end="handleMoveEnd"
          @start="handleMoveStart"
          @add="handleWidgetColAdd($event, element, colIndex)"
        >
         <transition-group name="fade" tag="div" class="widget-col-list">
            <design-form-item
              v-for="(el, i) in col.list.filter(c => c.key)"
              :key="el.key"
              :element="el"
              :select.sync="selectWidget"
              :index="i"
              :data.sync="col"
            ></design-form-item>
          </transition-group>
        </draggable>
      </el-tab-pane>
    </el-tabs>
  </div>
</template>
<script>
import Draggable from "vuedraggable";
import DesignFormItem from "@/components/portal/DesignFormItem.vue";
import WidgetFormItem from "@/components/form/WidgetFormItem.vue";
import WidgetGridLayout from "@/components/form/WidgetGridLayout.vue";
import WidgetSubtableLayout from "@/components/form/WidgetSubtableLayout.vue";
import WidgetSubdivLayout from "@/components/form/WidgetSubDivLayout.vue";
import WidgetDataViewLayout from "@/components/form/WidgetDataViewLayout.vue";
import controlsApi from "@/api/controlsConfig.js";
import deepmerge from "deepmerge";
export default {
  name: "design-tab-layout",
  components: {
    Draggable,
    DesignFormItem,
    WidgetFormItem,
    WidgetGridLayout,
    WidgetSubdivLayout,
    WidgetSubtableLayout,
    WidgetDataViewLayout
  },
  props: ["element", "select", "index", "data"],
  data() {
    return {
      selectWidget: this.select,
      activeName: 0
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
      //console.log("index", newIndex, oldIndex);
    },
    handleWidgetColAdd($event, row, colIndex) {
      if(row.columns[colIndex].list.length >1){
        this.$message.warning("tabs布局字段中不允许有多个栏目");
        row.columns[colIndex].list.splice($event.newIndex, 1);
        return;
      }
      if($event.item.innerText=='栅格布局' || $event.item.innerText=='tab布局'){
        this.$message.warning("布局字段中不允许再拖入布局字段");
         row.columns[colIndex].list.splice($event.newIndex, 1);
         return;
      }
      const newIndex = $event.newIndex;
      const oldIndex = $event.oldIndex;
      const item = $event.item;
      // 防止布局元素的嵌套拖拽
      if (item.className.indexOf("data-grid") >= 0) {
        // 如果是列表中拖拽的元素需要还原到原来位置
        item.tagName === "DIV" &&
          this.data.list.splice(
            oldIndex,
            0,
            row.columns[colIndex].list[newIndex]
          );

        row.columns[colIndex].list.splice(newIndex, 1);

        return false;
      }
      const key =
        Date.parse(new Date()) + "_" + Math.ceil(Math.random() * 99999);

      this.$set(row.columns[colIndex].list, newIndex, {
        ...row.columns[colIndex].list[newIndex],
        options: {
          ...row.columns[colIndex].list[newIndex].options,
          remoteFunc: "func_" + key
        },
        key,
        // 绑定键值
        model: row.columns[colIndex].list[newIndex].type + "_" + key,
        rules: []
      });

      controlsApi.handleLayoutComponents(this);
      this.selectWidget = row.columns[colIndex].list[newIndex];
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
      handler(val) {
        this.$emit("update:select", val);
      },
      deep: true
    }
  }
};
</script>
<style lang="scss" scoped>
@import "@/assets/css/form-editor.scss";

.widget-col {
  padding-bottom: 0;
  padding: 15px 5px;
}

.widget-col.active {
  outline: 1px solid #e6a23c;
}

.el-col {
  min-height: 50px;
}

.widget-col-list {
  min-height: 50px;
  border: 1px solid #ededed;
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
</style>
