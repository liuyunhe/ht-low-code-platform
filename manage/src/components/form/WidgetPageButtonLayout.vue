<template>
  <div class="widget-form-item" @click.capture="handleSelectWidget(index)">
    <!-- <div class="drag-widget" title="拖拽" v-if="selectWidget.key == element.key">
      <i class="icon-drag"></i>
    </div>
    <div class="widget-view-action" v-if="selectWidget.key == element.key">
      <i class="icon-trash" title="删除" @click.stop="handleWidgetDelete(index)"></i>
    </div>-->
    <el-row>
      <el-col :span="17" :push="2">
        <span style="font-weight:bold;font-size:14px;">1/{{data.pageSize}}</span>
      </el-col>
      <el-col :span="6">
        <el-button type="primary" :style="'background-color:'+element.nextButton.color+';border-color:'+element.nextButton.color"  :icon="element.nextButton.icon">{{element.nextButton.name}}</el-button>
        <el-button type="success" :style="'background-color:'+element.backButton.color+';border-color:'+element.backButton.color"  :icon="element.backButton.icon">{{element.backButton.name}}</el-button>
      </el-col>
    </el-row>
  </div>
</template>
<script>
import Draggable from "vuedraggable";
import WidgetFormItem from "@/components/form/WidgetFormItem.vue";

export default {
  name: "widget-page-button-layout",
  components: { Draggable, WidgetFormItem },
  props: ["element", "select", "index", "data"],
  data() {
    return {
      selectWidget: this.select,
      activeName: 0,
      showIndex: 0
    };
  },
  methods: {
    back() {
      this.showIndex -= 1;
    },
    next() {
      this.showIndex += 1;
    },
    handleCurrentChange(val) {
      this.showIndex = val - 1;
    },
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