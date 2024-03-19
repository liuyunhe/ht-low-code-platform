<template>
  <div class="widget-form-item" @click.capture="handleSelectWidget(index)">
    <div class="drag-widget" title="拖拽" v-if="selectWidget.key == element.key">
      <i class="icon-drag"></i>
    </div>
    <div class="widget-view-action" v-if="selectWidget.key == element.key">
      <i class="icon-trash" title="删除" @click.stop="handleWidgetDelete(index)"></i>
    </div>

    <div class="order">
      <span style="white-space:pre"></span>
      <span class="line"></span>
      <span style="white-space:pre"></span>
      <span class="txt">分页符</span>
      <span style="white-space:pre"></span>
      <span class="line"></span>
    </div>

    <!-- <el-steps v-if="element.options.showSteps" :active="showIndex" finish-status="success" >
      <el-step v-for="(col, colIndex) in element.columns" :key="colIndex" :title="col.span"></el-step>
    </el-steps>

    <el-container
      v-for="(col, colIndex) in element.columns"
      :key="colIndex"
      v-show="colIndex===showIndex"
    >
      <el-header height="25px">
      </el-header>

      <draggable
        v-model="col.list"
        :no-transition-on-drag="true"
        v-bind="{group:'form', ghostClass: 'ghost', animation: 200, handle: '.drag-widget'}"
        @end="handleMoveEnd"
        @add="handleWidgetColAdd($event, element, colIndex)"
      >
        <transition-group name="fade" tag="div" class="widget-col-list">
          <widget-form-item
            v-for="(el, i) in col.list.filter(c => c.key)"
            :key="el.key"
            :element="el"
            :select.sync="selectWidget"
            :index="i"
            :data="col"
          ></widget-form-item>
        </transition-group>
      </draggable>
      <el-footer>
        <el-row justify="center">
        
          <el-col :span="4" >
            <span style="font-weight:bold;font-size:14px;">{{showIndex+1}}/{{element.columns.length}}</span>
          </el-col>
          <el-col :span="4" :push="16">
            <el-button v-if="showIndex!=0" @click="back" type="primary" :style="'background-color:'+element.options.backBntjson.color+';border-color:'+element.options.backBntjson.color" :icon="element.options.backBntjson.icon">{{element.options.backBntjson.name}}</el-button>
            <el-button v-if="showIndex<element.columns.length-1" @click="next" type="primary" :style="'background-color:'+element.options.nextBntjson.color+';border-color:'+element.options.nextBntjson.color" :icon="element.options.nextBntjson.icon">{{element.options.nextBntjson.name}}</el-button>
          </el-col>
         
        </el-row>
      </el-footer>
    </el-container>-->
  </div>
</template>
<script>
import Draggable from "vuedraggable";
import WidgetFormItem from "@/components/form/WidgetFormItem.vue";
import  controlsApi from "@/api/controlsConfig.js";

export default {
  name: "widget-pagination-layout",
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
    handleSelectWidget(index) {
      this.selectWidget = this.data.list[index];
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
        //删除一个分页布局时,需要判断被删除的是否时最后一个分页布局
        if (this.data.pageSize == 2) {
          //最后一个分页布局
          // this.data.list.splice(0, 1);
          for(let i =this.data.list.length-1;i>=0;i--){
            if(this.data.list[i].ctrlType== "pageButton"){
              //删除分页布局按钮
              this.data.list.splice(i, 1);
            }else if(this.data.list[i].ctrlType== "pageSteps"){
              //删除分页布局条
              this.data.list.splice(i, 1);
            }
          }
          // this.data.list.pop();
        } else {
          this.data.list[0].pageSize -= 1;
          this.data.list[0].pageStepsArr.pop();
        }
        this.data.pageSize -= 1;
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

.order {
  height: 30px;
  line-height: 30px;
  text-align: center;
}
.order .line {
  display: inline-block;
  width: 47%;
  border-top: 3px solid #82b3d5;
}
.order .txt {
  color: #555;
  vertical-align: middle;
}

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