<template>
  <div class="widget-form-item"  @click.capture="handleSelectWidget(index)">
    <div
      class="drag-widget"
      title="拖拽"
      v-show="selectWidget.key == element.key"
    >
      <i class="icon-drag"></i>
    </div>
    <div class="widget-view-action" v-if="selectWidget.key == element.key">
      <i
        class="icon-copy"
        title="复制布局"
        @click.stop="handleWidgetClone(index)"
      ></i>
      <i
        class="icon-copy"
        title="复制布局+字段"
        @click.stop="handleWidgetFieldClone(index)"
      ></i>
      <i
        class="icon-trash"
        title="删除"
        @click.stop="handleWidgetDelete(index)"
      ></i>
    </div>
    <el-row
      class="widget-col"
      v-if="element && element.key"
      type="flex"
      :class="{ active: selectWidget.key == element.key}"
      :gutter="element.options.gutter ? element.options.gutter : 0"
      :justify="element.options.justify"
      :align="element.options.align"
    >
      <el-col
        v-for="(col, colIndex) in element.columns"
        :key="element.key+'_'+colIndex"
        :span="col.span ? col.span : 0"
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
            <widget-form-item
              v-for="(el, i) in col.list.filter(c => c.key)"
              :key="el.key"
              :element="el"
              :select.sync="selectWidget"
              :index="i"
              :selectWidgetList.sync="selectWidgetList"
              :data.sync="col"
            ></widget-form-item>
          </transition-group>
        </draggable>
      </el-col>
    </el-row>
  </div>
</template>
<script>
import Draggable from "vuedraggable";
import WidgetFormItem from "@/components/form/WidgetFormItem.vue";
import controlsApi from "@/api/controlsConfig.js";
import deepmerge from "deepmerge";
export default {
  name: "widget-grid-layout",
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
    handleWidgetColAdd($event, row, colIndex) {
      const newIndex = $event.newIndex;
      const oldIndex = $event.oldIndex;
      const item = $event.item;
      if(row.parentNodeType){
        let text = "";
        if(row.parentNodeType=="sub"){
          text = "子表";
        }else if(row.parentNodeType=="sun"){
          text = "孙表";
        }
        if(item.innerText=="二维码"){
          this.$message.warning(text+"不允许存在二维码");
          row.columns[colIndex].list.splice(newIndex, 1);
          return false;
        }
        if(item.innerText=="里程碑"){
          this.$message.warning(text+"不允许存在里程碑");
          row.columns[colIndex].list.splice(newIndex, 1);
          return false;
        }
        if (item.innerText == "表格布局") {
          this.$message.warning(text+"不允许存在表格布局");
          row.columns[colIndex].list.splice(newIndex, 1);
          return false;
        }
        if (item.innerText == "高德地图") {
          this.$message.warning(text+"不允许存在高德地图");
          row.columns[colIndex].list.splice(newIndex, 1);
          return false;
        }
        if(item.innerText=="相关流程"){
          this.$message.warning(text+"不允许存在相关流程");
          row.columns[colIndex].list.splice(newIndex, 1);
          return false;
        }
        if (item.innerText === "数据视图"){
          this.$message.warning(text+"不允许存在数据视图");
          row.columns[colIndex].list.splice(newIndex, 1);
          return false;
        }
      }
      // 防止布局元素的嵌套拖拽
      if (item.className.indexOf("data-grid") >= 0 || item.innerText=="分页符") {
        // 如果是列表中拖拽的元素需要还原到原来位置
        item.tagName === "DIV" &&
          this.data.list.splice(
            oldIndex,
            0,
            row.columns[colIndex].list[newIndex]
          );

        row.columns[colIndex].list.splice(newIndex, 1);
        if(item.innerText=="分页符"){
          this.$message.warning("栅格布局中不允许再拖入分页布局");
        }
        return false;
      }
      controlsApi.handleLayoutComponents(this, row, row.columns[colIndex].list, newIndex);
      if(row.columns[colIndex].list[newIndex]){
        this.selectWidget = row.columns[colIndex].list[newIndex];
        this.selectWidget.parentNodeType = row.parentNodeType;
        this.selectWidget.boSubEntity = row.boSubEntity;
      }
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
    },
    //复制布局+字段
    handleWidgetFieldClone(index) {
      let cloneData = deepmerge({}, this.data.list[index], { clone: true });

      cloneData.key =
              Date.parse(new Date()) + "_" + Math.ceil(Math.random() * 99999);

      cloneData.columns.forEach(v =>{
        v.list.forEach(t =>{
          t.key = Date.parse(new Date()) + "_" + Math.ceil(Math.random() * 99999);
        })
      })

      this.data.list.splice(index + 1, 0, cloneData);

      this.$nextTick(() => {
        this.selectWidget = this.data.list[index + 1];
      });
    },
    //复制布局
    handleWidgetClone(index) {
      let cloneData = deepmerge({}, this.data.list[index], { clone: true });

      cloneData.key =
              Date.parse(new Date()) + "_" + Math.ceil(Math.random() * 99999);
      cloneData.columns.forEach(v =>{
        v.list = [];
      })
      this.data.list.splice(index + 1, 0, cloneData);

      this.$nextTick(() => {
        this.selectWidget = this.data.list[index + 1];
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
