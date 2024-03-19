<template>
  <div class="widget-form-item" @click.capture="handleSelectWidget(index)">
    <div class="drag-widget" title="拖拽" v-if="selectWidget.key == element.key">
      <i class="icon-drag"></i>
    </div>
    <div class="widget-view-action" v-if="selectWidget.key == element.key">
      <i class="icon-trash" title="删除" @click.stop="handleWidgetDelete(index)"></i>
    </div>
    <el-row
      class="widget-col"
      v-if="element && element.key"
      type="flex"
      :class="{active: selectWidget.key == element.key}"
      :gutter="element.options.gutter ? element.options.gutter : 0"
      :justify="element.options.justify"
      :align="element.options.align"
    >
      <el-col
        v-for="(col, colIndex) in element.columns"
        :key="colIndex"
        :span="col.span ? col.span : 0"
      >
        <draggable
          v-model="col.list"
          :no-transition-on-drag="true"
          v-bind="{group:'form', ghostClass: 'ghost', animation: 200, handle: '.drag-widget'}"
          @end="handleMoveEnd"
          @add="handleWidgetColAdd($event, element, colIndex)"
        >
          <transition-group name="fade" tag="div" class="widget-col-list">
            <design-form-item
              v-for="(el, i) in col.list.filter(c => c.key)"
              :key="el.key"
              :element="el"
              :select.sync="selectWidget"
              :index="i"
              :data="col"
            ></design-form-item>
          </transition-group>
        </draggable>
      </el-col>
    </el-row>
  </div>
</template>
<script>
import Draggable from "vuedraggable";
import DesignFormItem from "@/components/portal/DesignFormItem.vue";

export default {
  name: "design-grid-layout",
  components: { Draggable, DesignFormItem },
  props: ["element", "select", "index", "data"],
  data() {
    return {
      selectWidget: this.select
    };
  },
  methods: {
    handleSelectWidget(index) {
      this.selectWidget = this.data.list[index];
    },
    handleMoveEnd({ newIndex, oldIndex }) {
      console.log("index", newIndex, oldIndex);
    },
    handleWidgetColAdd($event, row, colIndex) {
      console.log("coladd", $event, row, colIndex);
      const newIndex = $event.newIndex;
      const oldIndex = $event.oldIndex;
      const item = $event.item;
    if( $event.item.innerText=='tab布局'){
        this.$message.warning("布局字段中不允许再拖入布局字段");
        row.columns[colIndex].list.splice(newIndex, 1);
         return;
      }
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

      console.log("from", item);

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

      if (
        row.columns[colIndex].list[newIndex].type === "radio" ||
        row.columns[colIndex].list[newIndex].type === "checkbox" ||
        row.columns[colIndex].list[newIndex].type === "select"
      ) {
        this.$set(row.columns[colIndex].list, newIndex, {
          ...row.columns[colIndex].list[newIndex],
          options: {
            ...row.columns[colIndex].list[newIndex].options,
            options: row.columns[colIndex].list[newIndex].options.options.map(
              item => ({
                ...item
              })
            )
          }
        });
      }

      this.selectWidget = row.columns[colIndex].list[newIndex];
    },
    handleWidgetDelete(index) {
      if (this.data.list.length - 1 === index) {
        if (index === 0) {
          this.selectWidget = {};
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