<template>
  <el-container class="container">
    <el-header class="container__header" height="48px">
      <form-navigator
        ref="FormNavigator"
        @saveValidate="saveValidate"
        @close-dialog="close"
        @local-save="localSave"
        @load-local="loadLocal"
        :widgetForm="widgetForm"
        :form-data="formData"
        :form-id="formId"
      />
    </el-header>
    <el-container class="container__body">
      <el-aside class="container__body--control" width="230px" v-if="asideShow">
        <field-panel
          :bo-def-ids="boDefIds"
          :widgetForm="widgetForm"
          :form-type="formType"
          :form-id="formId"
          :copyFormList="copyFormList"
          @addTocopyFormList="addTocopyFormList"
        />
      </el-aside>
      <div
        class="navbar-collapse"
        :class="{'navbar-collapse-right': !asideShow}"
        @click="asideShow = !asideShow"
      >
        <div class="navbar-collapse-bg">
          <i
            class="navbar-collapse-arrow"
            :class="{
              'el-icon-arrow-left': asideShow,
              'el-icon-arrow-right': !asideShow,
            }"
          ></i>
        </div>
      </div>
      <el-main class="container__body--widget">
        <widget-panel
          ref="widgetForm"
          :data.sync="widgetForm"
          :select.sync="widgetFormSelect"
          :selectWidgetList.sync="selectWidgetList"
        />
      </el-main>
      <div
        class="navbar-collapse"
        :class="{'navbar-collapse-left': rightAsideShow}"
        @click="rightAsideShow = !rightAsideShow"
      >
        <div class="navbar-collapse-bg">
          <i
            class="navbar-collapse-arrow"
            :class="{
              'el-icon-arrow-right': rightAsideShow,
              'el-icon-arrow-left': !rightAsideShow,
            }"
          ></i>
        </div>
      </div>
      <el-aside
        width="350px"
        class="container__body--property"
        v-show="rightAsideShow"
      >
        <property-panel
          @saveEnd="saveEnd"
          ref="propertyPanel"
          :data.sync="widgetFormSelect"
          :bo-def-data="boDefData"
          :main-bo-fields.sync="mainBoFields"
          :sub-tables="subTables"
          :form-data.sync="formData"
          :sun-tables-map="sunTablesMap"
        />
      </el-aside>
    </el-container>
  </el-container>
</template>
<script>
import FormNavigator from '@/components/form/FormNavigator.vue'
import FieldPanel from '@/components/form/FieldPanel.vue'
import WidgetPanel from '@/components/form/WidgetPanel.vue'
import PropertyPanel from '@/components/form/PropertyPanel.vue'
import request from '@/request.js'
import {clustering} from 'echarts-stat'
import deepmerge from 'deepmerge'
import {
  advanceComponents,
  basicComponents,
  layoutComponents,
} from '@/api/controlsConfig.js'
export default {
  props: ['visibleDialog', 'formId', 'formDefId', 'addBpmForm', 'formType'],
  components: {FormNavigator, FieldPanel, WidgetPanel, PropertyPanel},
  data() {
    return {
      asideShow: true,
      rightAsideShow: true,
      widgetForm: {
        list: [],
        config: {
          labelWidth: 100,
          labelPosition: 'right',
          size: 'small',
        },
      },
      selectWidgetList: [],
      formData: this.addBpmForm,
      boDefData: null,
      widgetFormSelect: {options: {validateType: ''}},
      mainBoFields: [],
      subTables: [],
      sunTablesMap: {},
      boDefIds: '',
      copyFormList: [],
    }
  },
  watch: {
    visibleDialog: {
      handler: function (newVal) {
        if (newVal) {
          this.initData(this.formId, this.addBpmForm.bos)
        }
      },
      immediate: true,
    },
    widgetFormSelect: {
      handler: function (newVal) {
        if (['table', 'dialog'].includes(newVal.ctrlType)) {
          let components = []
          components = basicComponents.filter(
            (basic) => basic.ctrlType === newVal.ctrlType
          )
          if (!components.length) {
            components = layoutComponents.filter(
              (layout) => layout.ctrlType === newVal.ctrlType
            )
          }
          if (!components.length) {
            components = advanceComponents.filter(
              (advance) => advance.ctrlType === newVal.ctrlType
            )
          }
          if (components.length) {
            const item = components[0]
            var deepVal = deepmerge(item.options, newVal.options, {clone: true})
            newVal.options = deepVal
          }
        }
      },
      // immediate:true
      // deep:true
    },
  },
  mounted() {
    this.monitor()
  },
  methods: {
    addTocopyFormList(form) {
      if (this.copyFormList.length > 0) {
        let isIn = false
        this.copyFormList.forEach((item) => {
          if (item.id == form.id) {
            isIn = true
          }
        })
        if (!isIn) {
          this.copyFormList.push(form)
        }
      } else {
        this.copyFormList.push(form)
      }
    },
    monitor() {
      let that = this
      document.onkeydown = function (e) {
        //按下删除提交
        let key = window.event.keyCode
        //事件中keycode=18为删除事件 左Alt
        if (key == 18 && e.code == 'AltRight') {
          that.handleWidgetDelete()
        }
      }
    },
    //删除表单字段控件
    deleteWidget(list) {
      for (let i = list.length - 1; i >= 0; i--) {
        if (list[i].key && !list[i].columns && !list[i].rows && !list[i].list) {
          //没使用布局字段
          if (this.selectWidgetList.indexOf(list[i].key) != -1) {
            list.splice(i, 1)
          }
        } else if (list[i].columns && list[i].columns.length > 0) {
          //栅格，tab页签，折叠面板
          for (let j = list[i].columns.length - 1; j >= 0; j--) {
            this.deleteWidget(list[i].columns[j].list)
          }
        } else if (list[i].rows && list[i].rows.length > 0) {
          //表格布局
          for (let k = list[i].rows.length - 1; k >= 0; k--) {
            if (list[i].rows[k].cols.length > 0) {
              for (let m = list[i].rows[k].cols.length - 1; m >= 0; m--) {
                this.deleteWidget(list[i].rows[k].cols[m].list)
              }
            }
          }
        } else if (list[i].list && list[i].list.length > 0) {
          //子表，孙表
          this.deleteWidget(list[i].list)
        }
      }
    },
    handleWidgetDelete() {
      let list = this.widgetForm.list
      if (list.length > 0) {
        this.deleteWidget(list)
        this.selectWidgetList.empty()
      }
    },
    /**
     * 保存本地配置
     */
    localSave() {
      let localSaveData = {}
      localSaveData.widgetForm = this.widgetForm
      localSaveData.formData = this.formData
      localSaveData.boDefData = this.boDefData
      localSaveData.widgetFormSelect = this.widgetFormSelect
      localSaveData.mainBoFields = this.mainBoFields
      localSaveData.subTables = this.subTables
      localSaveData.sunTablesMap = this.sunTablesMap

      var jsonStr = JSON.stringify(localSaveData)
      var blob = new Blob([jsonStr], {type: 'application/json'})
      var saveAs = window.saveAs
      var name = this.formData.name || this.formData.key || '表单设计'
      saveAs(blob, name + new Date().getTime() + '.json')
    },
    /**
     * 加载本地存储
     */
    loadLocal(localSaveData) {
      // debugger;
      let newVersion = this.formData.rev
      this.widgetForm = localSaveData.widgetForm
      this.formData = localSaveData.formData
      this.formData.rev = newVersion
      this.boDefData = localSaveData.boDefData
      this.widgetFormSelect = localSaveData.widgetFormSelect
      this.mainBoFields = localSaveData.mainBoFields
      this.subTables = localSaveData.subTables
      this.sunTablesMap = localSaveData.sunTablesMap
      console.log(this.widgetFormSelect)
    },
    saveEnd() {
      this.$refs.FormNavigator.saveEnd()
    },
    saveValidate() {
      this.$refs.propertyPanel.saveValidate()
    },
    close(value) {
      if (value) {
        this.$emit('update:formDefId', value.formData.defId)
        this.$emit('update:formId', value.formData.id)
        this.formData = value.formData
        this.formData.rev = value.rev
      } else {
        this.$emit('update:visibleDialog', false)
      }
    },
    initData(formId, bos) {
      this.copyFormList = []
      if (this.formDefId) {
        request
          .get('${form}/form/formDef/v1/get?formDefId=' + this.formDefId)
          .then((response) => {
            this.widgetForm = JSON.parse(response.data.value.expand)
          })
      } else if (
        this.formData.templateConf &&
        this.formData.templateConf.boDefId
      ) {
        request
          .post(
            '${form}/form/form/v1/generateExpand',
            this.formData.templateConf
          )
          .then((response) => {
            this.widgetForm = JSON.parse(response.data.value)
          })
      }

      if (bos && bos.length > 0) {
        const boDefIds = bos.extractByKey('id').join(',')
        this.getBoDefData(boDefIds)
        this.widgetForm.boDefList = bos
        this.boDefIds = boDefIds
        return
      }

      if (formId) {
        request
          .get('${form}/form/form/v1/formDesign?formId=' + formId)
          .then((response) => {
            this.formData = response.data
            this.formData.id = formId
            this.boDefIds = JSON.parse(this.formData.bos)
              .extractByKey('id')
              .join(',')
            this.getBoDefData(this.boDefIds)
          })
      }
    },
    getBoDefData(boDefId) {
      request.post('${form}/bo/def/v1/getBOTree', boDefId).then((response) => {
        this.boDefData = response.data
        this.getMainBoFields()
      })
    },
    getMainBoFields() {
      this.mainBoFields = []
      // 多个BO   一个Bo 对应一个主表
      this.boDefData.children.forEach((element) => {
        let boData = {...element}
        let boSubTables = boData.children.filter(
          (field) => field.nodeType == 'sub'
        )

        boSubTables.forEach((subTable) => {
          //收集孙实体
          const sunTables = subTable.children.filter(
            (field) => field.nodeType == 'sub'
          )
          if (sunTables && sunTables.length > 0) {
            this.sunTablesMap[subTable.name] = sunTables
          }

          let sunTable1 = {...subTable}
          sunTable1.children = subTable.children.filter(
            (field) => field.status != 'hide' && field.nodeType != 'sub'
          )
          this.subTables.push(sunTable1)
        })

        // 删除子表字段
        boData.children = boData.children.filter((field) => {
          return field.nodeType != 'sub' && field.status != 'hide'
        })

        this.mainBoFields.push(boData)
      })
    },
  },
}
</script>

<style lang="scss" scoped>
@import '@/assets/css/element-variables.scss';

.container {
  height: 100%;
  .container__header {
    padding: 0;
    background: $--color-white;
    z-index: 7;
  }
  .container__body {
    height: calc(100% - 80px);
  }
  .container__footer {
    background: $--background-color-secondary;
    border-top: 1px solid $--border-color-base;
  }
  .container__body--control {
    box-shadow: 2px 0 5px $--border-color-light;
  }
  .container__body--widget {
    background: $--background-color-base;
    position: relative;
    padding: 0 5px;
    margin-top: 1px;
    padding-left: 0;
    margin-left: -8px;
    margin-right: -8px;
  }
  .container__body--property {
    margin-left: 3px;
    box-shadow: -2px 0 5px $--border-color-light;
    box-shadow: 0px 0px 20px #e4e7ed;
  }
  .navbar-collapse {
    margin-top: 40px;
    width: 10px;
    z-index: 999;
  }
  .navbar-collapse-bg {
    margin-left: 1px;
    height: 28px;
    border-top: 8px solid transparent;
    border-bottom: 8px solid transparent;
    border-left: 10px solid #fff;
    border-right: none;
    position: relative;
  }
  .navbar-collapse-left {
    .navbar-collapse-bg {
      margin-right: 1px;
      border-top: 8px solid transparent;
      border-bottom: 8px solid transparent;
      border-right: 10px solid #fff;
      border-left: none;
      .navbar-collapse-arrow {
        left: 0;
      }
    }
  }
  .navbar-collapse-bg:hover {
    cursor: pointer;
  }
  .navbar-collapse-arrow {
    position: absolute;
    left: -12px;
    top: 7px;
  }
}
/deep/ .el-switch {
  line-height: unset;
  height: unset;
}
</style>
