<template>
  <div
    @click.capture="handleSelectWidget(index)"
    class="widget-hottable"
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
        <HotTable  class="hot-table" ref="hottable" :root="root" :settings="hotSettings" ></HotTable>
      </el-form>
    </div>
  </div>
</template>
<script>
import { HotTable } from "@handsontable/vue";
import "handsontable/dist/handsontable.full.css";
import Handsontable from "handsontable";
import "handsontable/languages/zh-CN";
import  controlsApi from "@/api/controlsConfig.js";

export default {
  name: "widget-hottable-layout",
  components: {HotTable},
  props: ["element", "select", "index", "data"],
  data() {
    return {
      selectWidget: this.select,
      root: 'designer-hot',
      hotSettings: {
        data: [        //数据可以是二维数组，也可以是数组对象
          {xm:'李四',xb:'男',account:'lisi', nl:23},
          {xm:'张三',xb:'男',account:'zhangsan', nl:22},
        ],
        // colHeaders: true,
        startRows: 11,//行列范围
        startCols: 6,
        minRows: 1,  //最小行列
        minCols: 0,
        maxRows: 200,  //最大行列
        maxCols: 200,
        rowHeights: 25,
        rowHeaders: true,//行表头，可以使布尔值（行序号），可以使字符串（左侧行表头相同显示内容，可以解析html），也可以是数组（左侧行表头单独显示内容）。
        colHeaders: [ '姓名','性别', '账号','年龄'],//自定义列表头or 布尔值
        minSpareCols: 0, //列留白
        minSpareRows: 0,//行留白
        // currentRowClassName: 'currentRow', //为选中行添加类名，可以更改样式
        // currentColClassName: 'currentCol',//为选中列添加类名
        autoWrapRow: true, //自动换行
        contextMenu:{
          items:{
              "row_above": {
                name:'上方插入一行'
              },
              "row_below": {
                name:'下方插入一行'
              },
              "remove_row": {
                name: '删除行',
              },
          }
        },
        licenseKey: "non-commercial-and-evaluation",
        manualColumnFreeze: true, //手动固定列  ?
        manualColumnMove: true, //手动移动列
        manualRowMove: true,   //手动移动行
        manualColumnResize: true,//手工更改列距
        manualRowResize: true,//手动更改行距
        comments: true, //添加注释  
        customBorders:[],//添加边框
        columnSorting: true,//排序
        stretchH: 'all',//根据宽度横向扩展，last:只扩展最后一列，none：默认不扩展
        fillHandle: true, //选中拖拽复制 possible values: true, false, "horizontal", "vertical"
        fixedColumnsLeft: 2,//固定左边列数
        fixedRowsTop: 2,//固定上边列数
        beforeRemoveRow: this.beforeRemoveRowMe,
        afterCreateRow: this.afterCreateRow,
        afterChange: this.afterChangeMe,
        mergeCells: [   //合并
            // {row: 1, col: 1, rowspan: 3, colspan: 3},  //指定合并，从（1,1）开始行3列3合并成一格
            // {row: 3, col: 4, rowspan: 2, colspan: 2}
        ],
        columns: [
          {
            data:'xm',
            type: 'text', 
          },
          {
            data:'xb',
            type: 'text', 
          },
          {
            data:'account',
            type: 'text', 
          },
          {
            data:'nl',
            type: 'numeric', 
          },
        ],
      }
    };
  },
  methods: {
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
        this.$message.error("子表不允许存在二维码");
        element.list.splice(newIndex, 1);
        return false;
      }
      if(item.innerText=="里程碑"){
        this.$message.error("子表不允许存在里程碑");
        element.list.splice(newIndex, 1);
        return false;
      }
      if(item.innerText=="高德地图"){
        this.$message.error("子表不允许存在高德地图");
        element.list.splice(newIndex, 1);
        return false;
      }
      if(item.innerText=="相关流程"){
        this.$message.error("子表不允许存在相关流程");
        element.list.splice(newIndex, 1);
        return false;
      }
      if (!controlsApi.handleLayoutComponents(this)) {
        return;
      }
      if(!element.options.boSubEntity){
        this.$message.error("请先绑定子表");
        return false;
      }
      // 防止布局元素的嵌套拖拽
      if (item.isLayout) {
        element.list.list.splice(newIndex, 1);
        return false;
      }
      this.selectWidget = element.list[newIndex];
      this.selectWidget.parentNodeType = "hot";
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
    },
    beforeRemoveRowMe: function (changes, source) { // 数据改变时触发此方法
      this.hotSettings.dataList.splice(changes, source)
    },
    // 添加行
    afterCreateRowMe: function (changes) {
      this.hotSettings.dataList.splice(changes, 0, {
        region: '',
        destination: '',
        firstWeight: '',
        firstWeightPrice: '',
        riseWeight: '',
        riseWeightPrice: ''
      })
    },
    // 新增行时，动态改变值
    afterChangeMe: function (changes) {
      if (changes) {
        changes.forEach(([row, prop, oldValue, newValue]) => {
          console.log(oldValue)
          try {
            this.hotSettings.dataList[row][prop] = newValue;
          } catch (error) {}
        })
      }
    },
    // 查看-excel不可编辑
    excalEdit() {
      this.hotSettings.columns.forEach(par => {
        par.readOnly = true
      })
    },
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
    },
    'selectWidget.options.colHeadersRelations': {
      handler(val,oldVal) {
        if(val && val.length>0){
          if(oldVal !== val){
            let headers = [];
            let columns = [];
            let dataList = [[]];
            if(val.length>0){
              for (let index = 0; index < val.length; index++) {
                let relation = val[index];
                headers.push(relation.desc);
                columns.push(relation.column);
              }
            }
            this.hotSettings.colHeaders = headers;
            this.hotSettings.columns = columns;
            this.hotSettings.data = dataList;
            if(this.selectWidget.options.initFillbackData && this.selectWidget.options.initFillbackData.length>0){
              this.hotSettings.data = JSON.parse(JSON.stringify(this.selectWidget.options.initFillbackData));
            }
          }
        }
      },
      deep: true
    },
    'selectWidget.options.initFillbackData': {
      handler(val,oldVal) {
        if(oldVal !== val){
          if(val){
            this.hotSettings.data = JSON.parse(JSON.stringify(val));
          }else{
            this.hotSettings.data = [[]];
          }
        }
      },
      deep: true
    },
  }
};
</script>
<style lang="scss" scoped>
@import "@/assets/css/form-editor.scss";

.widget-hottable {
  padding-bottom: 0;
  padding: 10px 5px;
  position: relative;
}

.widget-hottable.active {
  outline: 1px solid #e6a23c !important;
}

.widget-hottable:hover {
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
>>> .hot-table{
  max-height: 150px;
  width: 95%;
}
</style>
