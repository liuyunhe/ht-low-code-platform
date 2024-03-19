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
    <el-collapse
      class="widget-col"
      v-if="element && element.key"
      type="flex"
      :class="{ active: selectWidget.key == element.key }"
      v-model="activeNames"
    >
      <el-collapse-item
        v-for="(col, colIndex) in element.columns"
        :key="colIndex"
        :title="col.span"
        :name="col.idKey"
      >
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
            <template v-for="(el, i) in col.list.filter(c => c.key)">
              <widget-grid-layout
                v-if="el.ctrlType == 'grid'"
                :key="el.key"
                :data.sync="col"
                :select.sync="selectWidget"
                :selectWidgetList.sync="selectWidgetList"
                :index="i"
                :element="el"
              />
              <widget-table-layout
                   v-else-if="el.ctrlType == 'tab'"
                  :key="el.key"
                  :data.sync="col"
                  :select.sync="selectWidget"
                  :selectWidgetList.sync="selectWidgetList"
                  :index="i"
                  :element="el"
                />
              <widget-subtable-layout
                v-else-if="el.ctrlType == 'subtable'"
                :key="el.key"
                :data.sync="col"
                :select.sync="selectWidget"
                :selectWidgetList.sync="selectWidgetList"
                :index="i"
                :element.sync="el"
              />
              <widget-subdiv-layout
                v-else-if="el.ctrlType == 'subDiv'"
                :key="el.key"
                :data.sync="col"
                :select.sync="selectWidget"
                :selectWidgetList.sync="selectWidgetList"
                :index="i"
                :element.sync="el"
              />
              <widget-hottable-layout
                v-else-if="el.ctrlType == 'hottable'"
                :key="el.key"
                :data.sync="col"
                :select.sync="selectWidget"
                :selectWidgetList.sync="selectWidgetList"
                :index="i"
                :element.sync="el"
              />
              <widget-main-table-layout
                v-else-if="el.ctrlType == 'table'"
                :key="el.key"
                :data.sync="col"
                :selectWidgetList.sync="selectWidgetList"
                :select.sync="selectWidget"
                :index="i"
                :element.sync="el"
              />
              <widget-form-item
                v-else
                :key="el.key"
                :element="el"
                :selectWidgetList.sync="selectWidgetList"
                :select.sync="selectWidget"
                :index="i"
                :data.sync="col"
              ></widget-form-item>
            </template>
          </transition-group>
        </draggable>
      </el-collapse-item>
    </el-collapse>
  </div>
</template>
<script>
import Draggable from "vuedraggable";
import WidgetFormItem from "@/components/form/WidgetFormItem.vue";
import WidgetGridLayout from "@/components/form/WidgetGridLayout.vue";
import WidgetTableLayout from "@/components/form/WidgetTableLayout.vue";
import WidgetSubtableLayout from "@/components/form/WidgetSubtableLayout.vue";
import WidgetSubdivLayout from "@/components/form/WidgetSubDivLayout.vue";
import WidgetHottableLayout from "@/components/form/WidgetHottableLayout.vue";
import WidgetMainTableLayout from "@/components/form/WidgetMainTableLayout.vue";
import controlsApi from "@/api/controlsConfig.js";
import deepmerge from "deepmerge";
export default {
  name: "widget-collapse-layout",
  components: {
    Draggable,
    WidgetFormItem,
    WidgetGridLayout,
    WidgetTableLayout,
    WidgetSubdivLayout,
    WidgetSubtableLayout,
    WidgetHottableLayout,
    WidgetMainTableLayout
  },
  props: ["element", "select", "index", "data","selectWidgetList"],
  data() {
    return {
      selectWidget: this.select
    };
  },
  computed: {
    activeNames: {
      get: function() {
        var obj = [];
        this.element.columns.forEach(item => {
          obj.push(item.idKey);
        });
        return obj;
      },
      set: function() {}
    }
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
    handleWidgetColAdd($event, row, colIndex) {
      const newIndex = $event.newIndex;
      const oldIndex = $event.oldIndex;
      const item = $event.item;

      // 防止布局元素的嵌套拖拽
      if (item.className.indexOf("data-grid") >= 0  || item.innerText=="分页符") {
        // 如果是列表中拖拽的元素需要还原到原来位置
        item.tagName === "DIV" &&
          this.data.list.splice(
            oldIndex,
            0,
            row.columns[colIndex].list[newIndex]
          );
        row.columns[colIndex].list.splice(newIndex, 1);
        if(item.innerText=="分页符"){
          this.$message.warning("折叠面板中不允许再拖入分页布局");
        }
        return false;
      }
      controlsApi.handleLayoutComponents(this, row, row.columns[colIndex].list, newIndex);
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
