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
    <table
      v-if="element && element.key"
      width="100%"
      class="widget-col"
      style="table-layout: fixed"
      :class="{active: selectWidget.key == element.key}"
      border="0"
      cellspacing="0"
      cellpadding="0"
    >
     <tr v-if="element.options.topLine.open" :key="element.rows + 2">
        <td
          :colspan="colSpan"
          :style="{
            width: '100%',
            height: '50' + 'px',
            border: element.options.topLine.useBorder
              ? '1px solid #EDEDED'
              : 'none',
            backgroudColor: element.options.topLine.bgColor,
            fontSize: element.options.topLine.fontSize,
            color: element.options.topLine.fontColor,
            padding: element.options.topLine.padding,
            textAlign: element.options.topLine.textAlign,
            wordWrap: 'break-word',
            wordBreak: 'break-word',
          }"
        >
          <span style="font-size: inherit !important">{{
            element.options.topLine.content
          }}</span>
        </td>
      </tr>
      <tr v-for="(row, rowIndex) in element.rows" :key="rowIndex">
        <td
          v-for="(col, colIndex) in row.cols"
          :key="colIndex"
          :style="{width: getTdWidth(row.cols, col)}"
          :colspan="col.colspan"
        >
          <draggable
            v-model="col.list"
            :no-transition-on-drag="true"
            v-bind="{
              group: 'form',
              ghostClass: 'ghost',
              animation: 200,
              handle: '.drag-widget',
            }"
            @end="handleMoveEnd"
            @start="handleMoveStart"
            @add="handleWidgetColAdd($event, element, rowIndex, colIndex)"
          >
            <transition-group name="fade" tag="div" class="widget-col-list">
              <widget-form-item
                v-for="(el, i) in col.list.filter((c) => c.key)"
                :key="el.key"
                :element="el"
                :select.sync="selectWidget"
                :selectWidgetList.sync="selectWidgetList"
                :index="i"
                :data.sync="col"
              ></widget-form-item>
            </transition-group>
          </draggable>
        </td>
      </tr>
      <tr v-if="element.options.bottomLine.open" :key="element.rows + 2">
        <td
          :colspan="colSpan"
          :style="{
            width: '100%',
            height: '50' + 'px',
            border: element.options.bottomLine.useBorder
              ? '1px solid #EDEDED'
              : 'none',
            backgroudColor: element.options.bottomLine.bgColor,
            fontSize: element.options.bottomLine.fontSize,
            color: element.options.bottomLine.fontColor,
            padding: element.options.bottomLine.padding,
            textAlign: element.options.bottomLine.textAlign,
            wordWrap: 'break-word',
            wordBreak: 'break-word',
          }"
        >
          <span style="font-size: inherit !important">{{
            element.options.bottomLine.content
          }}</span>
        </td>
      </tr>
    </table>
  </div>
</template>
<script>
import Draggable from 'vuedraggable'
import WidgetFormItem from '@/components/form/WidgetFormItem.vue'
import controlsApi from '@/api/controlsConfig.js'
import deepmerge from 'deepmerge'
export default {
  name: 'widget-main-table-layout',
  components: {Draggable, WidgetFormItem},
  props: ['element', 'select', 'index', 'data', 'selectWidgetList'],
  data() {
    return {
      selectWidget: this.select,
      colSpan: 1,
    }
  },
  methods: {
    handleMoveStart: function (evt) {
      // 新增控件时  将控件属性切断联系
      evt.item._underlying_vm_ = deepmerge({}, evt.item._underlying_vm_, {
        clone: true,
      })
      const key =
        Date.parse(new Date()) + '_' + Math.ceil(Math.random() * 99999)
      evt.item._underlying_vm_.key = key
    },
    getTdWidth(cols, col) {
      let colspans = 0
      cols.forEach((item) => {
        colspans += item.colspan
      })
      return (100 / colspans) * col.colspan + '%'
    },
    handleSelectWidget(index) {
      this.selectWidget = this.data.list[index]
    },
    handleMoveEnd({newIndex, oldIndex}) {
      console.log('index', newIndex, oldIndex)
    },
    handleWidgetColAdd($event, row, rowIndex, colIndex) {
      const newIndex = $event.newIndex
      const oldIndex = $event.oldIndex
      const item = $event.item
      if (item.innerText == '高德地图') {
        row.rows[rowIndex]['cols'][colIndex].list.splice(newIndex, 1)
        this.$message.warning('表格布局中不允许拖入高德地图')
        return false
      }
      //表格布局一个td中只允许拖入一个控件
      if (
        row.rows[rowIndex]['cols'][colIndex].list &&
        row.rows[rowIndex]['cols'][colIndex].list.length > 1
      ) {
        row.rows[rowIndex]['cols'][colIndex].list.splice(newIndex, 1)
        this.$message.warning('表格布局中每个单元格最多只允许拖入一个控件。')
        return false
      }
      // 防止布局元素的嵌套拖拽
      if (
        item.className.indexOf('data-grid') >= 0 ||
        item.innerText == '分页符'
      ) {
        // 如果是列表中拖拽的元素需要还原到原来位置
        item.tagName === 'DIV' &&
          this.data.list.splice(
            oldIndex,
            0,
            row.rows[rowIndex]['cols'][colIndex].list[newIndex]
          )
        row.rows[rowIndex]['cols'][colIndex].list.splice(newIndex, 1)
        if (item.innerText == '分页符') {
          this.$message.warning('表格布局中不允许再拖入分页布局')
        }
        return false
      }
      controlsApi.handleLayoutComponents(
        this,
        row,
        row.rows[rowIndex]['cols'][colIndex].list,
        newIndex
      )
      if (row.rows[rowIndex].cols[colIndex].list[newIndex]) {
        this.selectWidget = row.rows[rowIndex].cols[colIndex].list[newIndex]
        this.selectWidget.parentNodeType = row.parentNodeType
        this.selectWidget.boSubEntity = row.boSubEntity
      }
    },
    handleWidgetDelete(index) {
      if (this.data.list.length - 1 === index) {
        if (index === 0) {
          this.selectWidget = {options: {validateType: ''}}
        } else {
          this.selectWidget = this.data.list[index - 1]
        }
      } else {
        this.selectWidget = this.data.list[index + 1]
      }

      this.$nextTick(() => {
        this.data.list.splice(index, 1)
      })
    },
    handleWidgetClone(index) {
      let cloneData = deepmerge({}, this.data.list[index], {clone: true})

      cloneData.key =
        Date.parse(new Date()) + '_' + Math.ceil(Math.random() * 99999)
      cloneData.columns.forEach((v) => {
        v.list = []
      })
      this.data.list.splice(index + 1, 0, cloneData)

      this.$nextTick(() => {
        this.selectWidget = this.data.list[index + 1]
      })
    },
  },
  watch: {
    element: {
      handler: function (val) {
        if (!('topLine' in val.options)) {
          val.options.topLine = {}
        }
        if (!('bottomLine' in val.options)) {
          val.options.bottomLine = {}
        }
        if (val.ctrlType == 'table') {
          this.colSpan = 0
          val.rows[0].cols.forEach((col) => {
            // console.log(col);
            this.colSpan += col.colspan
          })
        }
      },
      immediate: true,
    },
    select(val) {
      this.selectWidget = val
    },
    selectWidget: {
      handler(val) {
        if (val.ctrlType == 'table') {
          this.colSpan = 0
          val.rows[0].cols.forEach((col) => {
            // console.log(col);
            this.colSpan += col.colspan
          })
        }
        this.$emit('update:select', val)
      },
      deep: true,
    },
  },
}
</script>
<style lang="scss" scoped>
@import '@/assets/css/form-editor.scss';

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
  width: 100%;
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
