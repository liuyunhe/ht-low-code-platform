<template>
  <el-dialog
    title="控件设置"
    :visible.sync="dialogVisible"
    width="45%"
    appendToBody
    :close-on-click-modal="false"
    :before-close="handleClose"
  >
    <el-form v-model="ctrlFiled" data-vv-scope="ctrlFieldForm">
      <table class="form-table" cellspacing="0" cellpadding="0" border="0">
        <tbody>
          <tr>
            <th width="15%">字段描述：</th>
            <td width="35%">
              <span>{{ ctrlFiled.name }}</span>
            </td>
            <th width="15%">字段名称：</th>
            <td width="35%">
              <span>{{ ctrlFiled.cm }}</span>
            </td>
          </tr>
          <tr>
            <th width="15%">字段类型：</th>
            <td width="35%">
              <span>{{ ctrlFiled.ty }}</span>
            </td>
            <th width="15%">控件类型：</th>
            <td width="35%">
              <span v-if="ctrlFiled.ct == 'select'">下拉选项</span>
              <span v-if="ctrlFiled.ct == 'radio'">单选按钮</span>
              <span v-if="ctrlFiled.ct == 'customDialog'">自定义对话框</span>
            </td>
          </tr>
          <tr v-if="ctrlFiled.ct != 'customDialog'">
            <th width="15%">下拉框选项：</th>
            <td width="100%" colspan="3">
              <ht-form-item
                customColon
                label="选项配置"
                label-width="100px"
                style="margin-bottom: 0px; margin-right: 0px"
              >
                <el-radio-group
                  @change="dynamicClick"
                  v-model="ctrlFiled.option.choiceType"
                  size="mini"
                  class="btn-radio"
                  style="float: right"
                  v-if="ctrlFiled.ct == 'select'"
                >
                  <el-radio-button label="static">固定选项</el-radio-button>
                  <el-radio-button label="dynamic">动态选项</el-radio-button>
                </el-radio-group>
              </ht-form-item>
              <div v-if="ctrlFiled.option.choiceType == 'static'">
                <table class="table-list custom_condition_tab table">
                  <tbody>
                    <tr>
                      <th colspan="3">
                        <el-button
                          @click="addControlContent"
                          type="primary"
                          size="mini"
                          style="float: left"
                          icon="el-icon-plus"
                          >添加</el-button
                        >
                      </th>
                    </tr>
                    <tr
                      v-for="(item, index) in controlContentArray"
                      :key="index"
                    >
                      <td>
                        值：
                        <ht-input
                          v-model="item.key"
                          :validate="{required: true}"
                          :maxlength="50"
                          :showWordLimit="true"
                        ></ht-input>
                      </td>
                      <td>
                        选项：
                        <ht-input
                          v-model="item.value"
                          :validate="{required: true}"
                          :maxlength="50"
                          :showWordLimit="true"
                        ></ht-input>
                      </td>
                      <td>
                        <el-button
                          @click="sort(index, 'down')"
                          size="small"
                          icon="el-icon-arrow-down"
                          plain
                        ></el-button>
                        <el-button
                          @click="sort(index, 'up')"
                          size="small"
                          icon="el-icon-arrow-up"
                          plain
                        ></el-button>
                        <el-button
                          @click="remove(index)"
                          size="small"
                          icon="el-icon-delete"
                          plain
                        ></el-button>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
              <div
                v-if="ctrlFiled.option.choiceType == 'dynamic'"
                class="customQuery-inputs"
              >
                <ht-load-data
                  :url="customQueryUrl"
                  requestMethod="post"
                  context="form"
                  @after-load-data="afterCustomQueryLoadData"
                ></ht-load-data>
                <ht-select
                  clearable
                  filterable
                  @change="setCurrentCustomQuery()"
                  v-model="ctrlFiled.option.customQuery.alias"
                  :options="customQuerys"
                  :props="{key: 'alias', value: 'name'}"
                />

                <ht-form-item
                  label
                  label-width
                  v-if="
                    ctrlFiled.option.bind && ctrlFiled.option.bind.length > 0
                  "
                  class="choiceType-bottom"
                >
                  <template slot="label">
                    <el-tooltip content="自定义查询需要的参数传入">
                      <i class="property-tip icon-question" />
                    </el-tooltip>
                    <span>参数绑定</span>
                  </template>
                  <br />
                  <ht-form-item
                    :label="bind.comment"
                    label-width="50px"
                    class="customQuery-select"
                    v-for="(bind, index) in ctrlFiled.option.bind"
                    :key="index"
                  >
                    <el-select
                      clearable
                      v-model="bind.fieldPath"
                      placeholder="请选择"
                    >
                      <el-option
                        v-for="item in conditionFields.filter(
                          (field) => field.na != ctrlFiled.name
                        )"
                        :key="item.value"
                        :label="item.cm"
                        :value="item.value"
                      >
                      </el-option>
                    </el-select>
                  </ht-form-item>
                </ht-form-item>

                <ht-form-item label label-width class="choiceType-bottom">
                  <template slot="label">
                    <el-tooltip content="返回值作为选项时的绑定">
                      <i class="property-tip icon-question" />
                    </el-tooltip>
                    <span>选项绑定</span>
                  </template>
                  <br />
                  <ht-form-item
                    label="值"
                    label-width="50px"
                    class="customQuery-inputs"
                    style="float: left; float: left"
                  >
                    <ht-select
                      clearable
                      style="width: 100%"
                      v-model="ctrlFiled.option.customQuery.valueBind"
                      :options="ctrlFiled.option.customQuery.resultfield"
                      :props="{key: 'field', value: 'comment'}"
                    />
                  </ht-form-item>
                  <ht-form-item
                    label="标签"
                    label-width="50px"
                    class="customQuery-inputs"
                    style="float: left; float: right"
                  >
                    <ht-select
                      clearable
                      style="width: 100%"
                      v-model="ctrlFiled.option.customQuery.labelBind"
                      :options="ctrlFiled.option.customQuery.resultfield"
                      :props="{key: 'field', value: 'comment'}"
                    />
                  </ht-form-item>
                </ht-form-item>
              </div>
            </td>
          </tr>
          <tr v-if="ctrlFiled.ct == 'customDialog'">
            <th width="15%">自定义对话框：</th>
            <td width="35%">
              <ht-select
                @change="changeDialog"
                v-model="controlContentObject.alias"
                :options="customDialogs"
                :validate="{required: true}"
              />
            </td>
            <th width="15%">显示字段：</th>
            <td width="35%">
              <ht-select
                v-model="controlContentObject.resultField"
                @change="changeResultField"
                :validate="{required: true}"
                :options="custDialogFields"
              />
            </td>
          </tr>
          <tr v-if="ctrlFiled.ct == 'customDialog' && custDialogFields.length >0">
            <th width="15%">返回字段：</th>
            <td colspan="3">
              <table
                class="form-table"
                cellspacing="0"
                cellpadding="0"
                border="0"
              >
                <tbody>
                  <tr class="linkageTable-tr">
                    <td width="40.9%;">返回结果字段</td>
                    <td >绑定显示的属性</td>
                  </tr>

                  <tr
                    class="linkageTable-tr"
                    v-for="(field, index) in custDialogFields"
                    :key="index"
                  >
                    <td>{{ field.value }}</td>
                    <td>
                      <el-select
                        clearable
                        v-model="custDialogprop[field.value]"
                        placeholder="请选择"
                      >
                        <el-option
                          v-for="item in conditionFields.filter(
                            (field) => field.na != ctrlFiled.name
                          )"
                          :key="item.value"
                          :label="item.cm"
                          :value="item.value"
                        >
                        </el-option>
                      </el-select>
                    </td>
                  </tr>
                </tbody>
              </table>
            </td>
          </tr>
          <tr
            v-if="
              ctrlFiled.ct == 'customDialog' &&
              conditionfield &&
              conditionfield.length > 0
            "
          >
            <th width="15%">列表参数绑定：</th>
            <td colspan="3">
              <table
                class="form-table custDialog-table"
                cellspacing="0"
                cellpadding="0"
                border="0"
              >
                <tbody>
                  <tr class="linkageTable-tr">
                    <td width="40.9%;">参数名</td>
                    <td>取值对象</td>
                  </tr>
                  <tr
                    class="linkageTable-tr"
                    v-for="(condition, indexCondition) in conditionfield"
                    :key="indexCondition"
                  >
                    <td>{{ condition.comment }}</td>
                    <td>
                      <el-select
                        clearable
                        v-model="condition.bind"
                        placeholder="请选择"
                      >
                        <el-option
                          v-for="item in conditionFields.filter(
                            (field) => field.na != ctrlFiled.name
                          )"
                          :key="item.value"
                          :label="item.cm"
                          :value="item.value"
                        >
                        </el-option>
                      </el-select>
                    </td>
                  </tr>
                </tbody>
              </table>
            </td>
          </tr>
        </tbody>
      </table>
    </el-form>

    <span slot="footer" class="dialog-footer">
      <el-button type="primary" @click="onConfirm">确 定</el-button>
      <el-button @click="dialogVisible = false">取 消</el-button>
    </span>
  </el-dialog>
</template>
<script>
import form from '@/api/form.js'

export default {
  name: 'template-ctrl-field-dialog',
  components: {},
  props: {},
  data() {
    return {
      ctrlFiled: {},
      controlContentObject: {},
      controlContentArray: [],
      customDialogs: [],
      custDialogFields: [],
      dialogVisible: false,
      conditionFields: [],
      conditionfield: [],
      customQuerys: [],
      customQueryUrl: '/form/customQuery/v1/list',
      custDialogprop:{}
    }
  },
  created() {
    if (!this.ctrlFiled.option) {
      this.ctrlFiled.option = {
        choiceType: 'static',
        customQuery: {},
      }
    }
  },
  methods: {
    initData() {
      if (this.ctrlFiled.ct == 'customDialog') {
        if (this.ctrlFiled.controlContent) {
          this.controlContentObject = this.ctrlFiled.controlContent
        }
        if(this.ctrlFiled.custDialogprop && Object.keys(this.ctrlFiled.custDialogprop).length!=0){
          this.custDialogprop =this.ctrlFiled.custDialogprop;
        }
        this.changeDialog()
        form.getCustomDialogs().then((response) => {
          this.customDialogs = []
          if (response && response.length > 0) {
            response.forEach((d) => {
              this.customDialogs.push({key: d.alias, value: d.name})
            })
          }
        })
      } else {
        if (
          this.ctrlFiled.controlContent &&
          this.ctrlFiled.controlContent.length > 0
        ) {
          this.controlContentArray = this.ctrlFiled.controlContent
        } else {
          this.controlContentArray = []
        }
      }
    },
    handleClose() {
      this.dialogVisible = false
    },
    showDialog(row, conditionFields) {
      this.ctrlFiled = row
      if (conditionFields) {
        conditionFields.forEach((item) => {
          item.value = item.colPrefix + item.na
        })
      }
      this.conditionFields = conditionFields

      this.dialogVisible = true
      this.initData()
    },
    addControlContent() {
      this.controlContentArray.push({key: '', value: ''})
    },
    changeDialog() {
      if (this.controlContentObject.alias) {
        const this_ = this
        form
          .getCustomDialogByAlias(this.controlContentObject.alias)
          .then((response) => {
            this.custDialogFields = []
            //this.controlContentObject.resultField = ''
            if (response && response.resultfield) {
              let fields = JSON.parse(response.resultfield)
              fields.forEach((f) => {
                this.custDialogFields.push({key: f.comment, value: f.comment})
              })
            }
            if (response && response.conditionfield) {
              this.conditionfield = JSON.parse(response.conditionfield)
              if (this_.ctrlFiled.bind) {
                this.conditionfield.forEach((conf) => {
                  this_.ctrlFiled.bind.forEach((fbind) => {
                    if (
                      !conf.bind &&
                      conf.field.toLowerCase() == fbind.field.toLowerCase()
                    ) {
                      this_.$set(conf, 'bind', fbind.bind)
                    }
                  })
                })
              }
            }
          })
      }
    },
    onConfirm(selection) {
      if (this.ctrlFiled.ct == 'customDialog') {
        this.ctrlFiled.controlContent = this.controlContentObject
        if (this.conditionfield && this.conditionfield.length > 0) {
          this.ctrlFiled.bind = this.conditionfield
        }
        if(Object.keys(this.custDialogprop).length!=0){
          this.ctrlFiled.custDialogprop=this.custDialogprop;
        }
      } else {
        this.ctrlFiled.controlContent = this.controlContentArray
      }
      this.dialogVisible = false
      this.$emit('onConfirm', this.ctrlFiled)
    },
    //显示字段排序
    sort(index, type) {
      if ('up' == type) {
        if (index === 0) {
          this.$message({
            message: '已经是列表中第一位',
            type: 'warning',
          })
        } else {
          let temp = this.controlContentArray[index - 1]
          this.$set(
            this.controlContentArray,
            index - 1,
            this.controlContentArray[index]
          )
          this.$set(this.controlContentArray, index, temp)
        }
      } else {
        if (index === this.controlContentArray.length - 1) {
          this.$message({
            message: '已经是列表中最后一位',
            type: 'warning',
          })
        } else {
          let i = this.controlContentArray[index + 1]
          this.$set(
            this.controlContentArray,
            index + 1,
            this.controlContentArray[index]
          )
          this.$set(this.controlContentArray, index, i)
        }
      }
    },
    //删除显示字段
    remove(index) {
      this.controlContentArray.splice(index, 1)
    },
    changeResultField() {
      this.$forceUpdate()
    },
    //切换固定选项和动态选项时
    dynamicClick() {
      this.controlContentArray = []
      this.customQueryUrl = '/form/customQuery/v1/list'
      this.ctrlFiled.option.customQuery = {
        valueBind: '',
        labelBind: '',
        conditionfield: [],
        custQueryJson: [],
      }
      this.ctrlFiled.option.bind = []
      this.ctrlFiled.option.options = []
      if (this.ctrlFiled.option.choiceType == 'dynamic') {
        this.ctrlFiled.option.linkage = []
      }
    },
    afterCustomQueryLoadData(data) {
      this.customQuerys = data.rows
    },
    //选择动态选项
    setCurrentCustomQuery() {
      const _this = this
      _this.ctrlFiled.option.customQuery.custQueryJson = []
      _this.customQuerys.forEach((item) => {
        if (_this.ctrlFiled.option.customQuery.alias == item.alias) {
          if (typeof item.conditionfield == 'string') {
            item.conditionfield = JSON.parse(item.conditionfield) //parseToJson(item.customQuery.conditionfield);
            item.resultfield = JSON.parse(item.resultfield) // parseToJson(item.customQuery.resultfield);
          }
          //把当前对象克隆一份到控件属性配置
          Object.assign(_this.ctrlFiled.option.customQuery, item)
          // _this.slimCustomQuery(_this.ctrlFiled.option.customQuery);
        }
      })
      //删除掉无效的参数
      var bind = []
      this.ctrlFiled.option.customQuery.conditionfield.forEach((item) => {
        if (item.defaultType == 1) {
          bind.push(item)
        }
      })
      this.ctrlFiled.option.bind = bind
      //切换关联数据设置项或下拉框动态值 同时清空绑定返回值、参数绑定、选项绑定
      this.custDialogprop = {}
      this.ctrlFiled.option.gangedBind = {}
      this.ctrlFiled.option.customQuery.valueBind = ''
      this.ctrlFiled.option.customQuery.labelBind = ''
      if (this.ctrlFiled.option.customQuery.conditionfield) {
        this.ctrlFiled.option.customQuery.conditionfield.forEach((element) => {
          this.$set(element, 'fieldPath', '')
        })
      }
    },
  },
}
</script>
<style  scoped>
div >>> .el-dialog__body {
  padding: 10px;
}
.customQuery-inputs >>> .inputs,
.customQuery-inputs >>> .inputs .el-select {
  width: 100%;
}
.customQuery-select:nth-child(even) {
  float: left;
}
.customQuery-select:nth-child(odd) {
  float: right;
}
>>> .el-form-item__label {
  text-align: left;
}
.choiceType-bottom {
  margin-bottom: 0px;
}
.choiceType-bottom >>> .el-form-item {
  margin-bottom: 5px;
}
</style>
