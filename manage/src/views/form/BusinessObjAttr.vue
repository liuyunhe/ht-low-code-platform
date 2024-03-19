<template>
  <el-card class="card">
    <div slot="header" class="card__header flex">
      <span class="card__header--span">字段列表</span>
      <div class="card__btngroup">
        <el-button
          @click="addAttrRows"
          :disabled="
            (formData.ents[entIndex] &&
              formData.ents[entIndex].isExternal != '1') ||
            (grandSonIndex != -1 &&
              formData.ents[entIndex].children &&
              formData.ents[entIndex].children[grandSonIndex] &&
              formData.ents[entIndex].children[grandSonIndex].isExternal != '1')
              ? false
              : true
          "
          type="primary"
        >
          <el-tooltip
            class="item"
            effect="dark"
            content="按F2可快速添加字段"
            placement="top"
          >
            <i class="icon-question" style="margin-right: 8px" /> </el-tooltip
          >添加字段
        </el-button>
        <!-- <el-button
          @click="checkEntFunc(true)"
          :disabled="formData.ents[entIndex] && formData.ents[entIndex].isExternal != '1' || grandSonIndex != -1 && formData.ents[entIndex].children && formData.ents[entIndex].children[grandSonIndex] && formData.ents[entIndex].children[grandSonIndex].isExternal != '1'?false:true"
          type="warning"
        >
          <el-tooltip class="item" effect="dark" content="校验当前选中实体的字段" placement="top">
            <i class="icon-question" style="margin-right: 8px" />
          </el-tooltip>校验字段
        </el-button> -->
        <!-- <el-button
          @click="refreshAttr()"
          v-if="formData.ents[entIndex] && formData.ents[entIndex].isExternal == '1' && formData.ents[entIndex].id"
          :disabled="formData.ents[entIndex] && formData.ents[entIndex].isExternal == '1' || grandSonIndex != -1 && formData.ents[entIndex].children && formData.ents[entIndex].children[grandSonIndex] &&  formData.ents[entIndex].children[grandSonIndex].isExternal == '1'?false:true"
          type="primary"
          style="margin-top: 9px;"
        >刷新字段</el-button> -->
        <el-button
          @click="reloadByEntId(formData.ents[entIndex])"
          v-if="
            formData.ents[entIndex] &&
            formData.ents[entIndex].id &&
            formData.ents[entIndex].isExternal == '1'
              ? true
              : false
          "
          type="primary"
          style="margin-top: 9px;"
        >
          刷新字段</el-button
        >
      </div>
    </div>
    <div v-if="formData.ents.length != 0" class="card__body" ref="cardBody">
      <el-scrollbar ref="scrollbar" class="scrollbar-fullheight" style="height:500px;">
        <el-table
          :data="attrData"
          ref="attrTableScrollbarHeight"
          data-vv-scope="attr"
        >
          <el-table-column
            label="序号"
            type="index"
            align="center"
            width="50"
          ></el-table-column>
          <el-table-column label="注释" align="center">
            <template slot-scope="scope">
              <el-form-item class="table-item">
                <el-tooltip
                  class="item"
                  effect="dark"
                  :content="scope.row.comment"
                  placement="top-start"
                  :disabled="scope.row.comment ? false : true"
                >
                  <ht-input
                    v-model="scope.row.comment"
                    placeholder="请输入内容"
                    :id="scope.row.name + 'comment' + scope.$index"
                    @blur="entBlur(scope.$index)"
                    @input="
                      chineseFormat(
                        scope.row.name + 'attrName' + scope.$index,
                        attrData,
                        'name',
                        scope.$index,
                        scope.row.comment
                      )
                    "
                    clearable
                    :validate="{required: true}"
                    :maxlength="50"
                  ></ht-input>
                </el-tooltip>
              </el-form-item>
            </template>
          </el-table-column>
          <el-table-column label="名称" align="center">
            <template slot-scope="scope">
              <el-form-item class="table-item">
                <span
                  v-if="
                    (scope.row.id && formData.deployed) ||
                      scope.row.status == 'hide' ||
                      (openGrandSonAttr
                        ? grandSonIndex != -1 &&
                          formData.ents[entIndex].children[grandSonIndex]
                            .isExternal == '1'
                        : formData.ents[entIndex].isExternal == '1')
                  "
                  >{{ scope.row.name }}</span
                >
                <ht-input
                  v-else
                  :id="scope.row.name + 'attrName' + scope.$index"
                  v-model="scope.row.name"
                  @blur="entBlur(scope.$index)"
                  placeholder="请输入内容"
                  :maxlength="50"
                  :validate="
                    'required: true|regex:^[a-zA-Z][a-zA-Z0-9_]*$,只能输入字母、数字、下划线，且以字母开头'
                  "
                ></ht-input>
              </el-form-item>
            </template>
          </el-table-column>
          <el-table-column label="必填" width="70" align="center">
            <template slot-scope="scope">
              <el-form-item class="table-item">
                <span
                  v-if="
                    (scope.row.id && formData.deployed) ||
                      scope.row.status == 'hide' ||
                      (openGrandSonAttr
                        ? grandSonIndex != -1 &&
                          formData.ents[entIndex].children[grandSonIndex]
                            .isExternal == '1'
                        : formData.ents[entIndex].isExternal == '1')
                  "
                >
                  <span v-if="scope.row.isRequired == 1">是</span>
                  <span v-else>否</span>
                </span>
                <el-switch
                  v-else
                  v-model="scope.row.isRequired"
                  inactive-value="0"
                  active-value="1"
                />
              </el-form-item>
            </template>
          </el-table-column>
          <el-table-column label="数据类型" align="center">
            <el-table-column prop="name" label="类型" align="center">
              <template slot-scope="scope">
                <el-form-item class="table-item">
                  <span
                    v-if="
                      (scope.row.id && formData.deployed) ||
                        scope.row.status == 'hide' ||
                        (openGrandSonAttr
                          ? grandSonIndex != -1 &&
                            formData.ents[entIndex].children[grandSonIndex]
                              .isExternal == '1'
                          : formData.ents[entIndex].isExternal == '1')
                    "
                  >
                    <span disabled v-if="scope.row.dataType == 'varchar'"
                      >字符串</span
                    >
                    <span disabled v-else-if="scope.row.dataType == 'number'"
                      >数字</span
                    >
                    <span disabled v-else-if="scope.row.dataType == 'date'"
                      >日期</span
                    >
                    <span
                      disabled
                      v-else-if="
                        scope.row.dataType == 'text' ||
                          scope.row.dataType == 'clob'
                      "
                      >大文本</span
                    >
                    <span disabled v-else>其他类型</span>
                  </span>
                  <ht-select
                    v-else
                    class="m-r"
                    :options="dataType"
                    v-model="scope.row.dataType"
                    @change="defaultDataFormat(scope.row, scope.$index)"
                  />
                </el-form-item>
              </template>
            </el-table-column>
            <el-table-column align="center" label="格式" width="210">
              <template slot-scope="scope">
                <el-form-item class="table-item">
                  <span
                    v-if="
                      scope.row.dataType != 'date' &&
                      scope.row.dataType != '日期'
                        ? false
                        : (scope.row.id && formData.deployed) ||
                          scope.row.status == 'hide' ||
                          (openGrandSonAttr
                            ? grandSonIndex != -1 &&
                              formData.ents[entIndex].children[grandSonIndex]
                                .isExternal == '1'
                            : formData.ents[entIndex].isExternal == '1')
                    "
                    >{{ scope.row.format }}</span
                  >
                  <ht-select
                    v-else-if="scope.row.dataType == 'date'"
                    v-model="scope.row.format"
                    :props="{key: 'key', value: 'value'}"
                    :options="dateFormat"
                  ></ht-select>
                </el-form-item>
              </template>
            </el-table-column>
          </el-table-column>
          <el-table-column label="属性长度" align="center">
            <el-table-column prop="name" label="整数长度" align="center">
              <template slot-scope="scope">
                <el-form-item
                  class="table-item"
                  v-if="scope.row.dataType != 'clob'"
                >
                  <span
                    v-if="
                      (scope.row.attrLength != 0 &&
                        scope.row.id &&
                        formData.deployed) ||
                        (scope.row.status == 'hide' &&
                          scope.row.attrLength != 0) ||
                        (openGrandSonAttr
                          ? grandSonIndex != -1 &&
                            formData.ents[entIndex].children[grandSonIndex]
                              .isExternal == '1'
                          : formData.ents[entIndex].isExternal == '1')
                    "
                  >
                    <span v-if="scope.row.dataType == 'number'">{{
                      scope.row.intLen
                    }}</span>
                    <span v-else>{{ scope.row.attrLength }}</span>
                  </span>
                  <el-input
                    v-else-if="
                      scope.row.dataType == 'number' ||
                        scope.row.dataType == 'varchar'
                    "
                    :id="scope.row.name + 'attrLen' + scope.$index"
                    v-model="scope.row.attrLength"
                    @blur="entBlur(scope.$index)"
                  ></el-input>
                </el-form-item>
              </template>
            </el-table-column>
            <el-table-column label="小数长度" align="center">
              <template slot-scope="scope">
                <el-form-item class="table-item">
                  <span
                    v-if="
                      scope.row.dataType != 'number' &&
                      scope.row.dataType != '数字'
                        ? false
                        : (scope.row.id && formData.deployed) ||
                          scope.row.status == 'hide' ||
                          (openGrandSonAttr
                            ? grandSonIndex != -1 &&
                              formData.ents[entIndex].children[grandSonIndex]
                                .isExternal == '1'
                            : formData.ents[entIndex].isExternal == '1')
                    "
                    >{{ scope.row.decimalLen }}</span
                  >
                  <el-input
                    v-else-if="scope.row.dataType == 'number'"
                    :id="scope.row.name + 'decima' + scope.$index"
                    v-model="scope.row.decimalLen"
                    @blur="entBlur(scope.$index)"
                  ></el-input>
                </el-form-item>
              </template>
            </el-table-column>
          </el-table-column>
          <el-table-column label="默认值" width="250" align="center">
            <template slot-scope="scope">
              <el-form-item class="table-item">
                <ht-input
                  v-if="
                    scope.row.dataType != 'clob' && scope.row.dataType != 'date'
                  "
                  v-model="scope.row.defaultValue"
                  placeholder="请输入内容"
                  :disabled="
                    (formData.ents[entIndex] &&
                      formData.ents[entIndex].isExternal != '1') ||
                    (grandSonIndex != -1 &&
                      formData.ents[entIndex].children &&
                      formData.ents[entIndex].children[grandSonIndex] &&
                      formData.ents[entIndex].children[grandSonIndex]
                        .isExternal != '1')
                      ? false
                      : true
                  "
                  :name="'defaultValue' + scope.$index"
                  :validate="{
                    required: scope.row.isRequired === '1' ? true : false
                  }"
                  :maxlength="250"
                  @blur="entBlur(scope.$index)"
                ></ht-input>
                <ht-date
                  v-else-if="scope.row.dataType == 'date'"
                  v-model="scope.row.defaultValue"
                  :format="scope.row.format"
                  :validate="{
                    required: scope.row.isRequired === '1' ? true : false
                  }"
                  :value-format="scope.row.format"
                  :disabled="
                    (formData.ents[entIndex] &&
                      formData.ents[entIndex].isExternal != '1') ||
                    (grandSonIndex != -1 &&
                      formData.ents[entIndex].children &&
                      formData.ents[entIndex].children[grandSonIndex] &&
                      formData.ents[entIndex].children[grandSonIndex]
                        .isExternal != '1')
                      ? false
                      : true
                  "
                  placeholder="请选择日期"
                ></ht-date>
              </el-form-item>
            </template>
          </el-table-column>
          <el-table-column label="操作" align="center" width="100">
            <template slot-scope="scope">
              <el-button
                v-if="scope.row.status == 'hide'"
                @click="recovery(scope.row)"
                >恢复</el-button
              >
              <el-dropdown
                size="mini"
                split-button
                v-else-if="
                  (formData.ents[entIndex].attributeList.length > 1 &&
                    scope.row.isExternal != '1') ||
                    (formData.ents[entIndex].children &&
                      attrTableData.length > 1)
                "
                @command="handleCommand"
                @click="
                  handleCommand({
                    command: 'del',
                    index: scope.$index,
                    row: scope.row
                  })
                "
              >
                <i class="el-icon-delete-solid"></i>
                <el-dropdown-menu slot="dropdown">
                  <el-dropdown-item
                    :disabled="scope.$index == 0 ? true : false"
                    :command="{
                      command: 'up',
                      row: scope.row,
                      index: scope.$index
                    }"
                  >
                    上升
                    <i class="el-icon-arrow-up"></i>
                  </el-dropdown-item>
                  <el-dropdown-item
                    :disabled="
                      scope.$index ==
                      (openGrandSonAttr
                        ? attrTableData.length - 1
                        : formData.ents[entIndex].attributeList.length - 1)
                        ? true
                        : false
                    "
                    :command="{
                      command: 'down',
                      row: scope.row,
                      index: scope.$index
                    }"
                  >
                    下降
                    <i class="el-icon-arrow-down"></i>
                  </el-dropdown-item>
                </el-dropdown-menu>
              </el-dropdown>
              <el-button
                size="mini"
                class="el-icon-delete-solid"
                plain
                v-else
                disabled
              ></el-button>
            </template>
          </el-table-column>
        </el-table>
      </el-scrollbar>
    </div>
  </el-card>
</template>

<script>
import form from '@/api/form.js'
import utils from '@/hotent-ui-util.js'

export default {
  name: 'BusinessObjAttr',
  props: [
    'openGrandSonAttr',
    'attrTableData',
    'formData',
    'entIndex',
    'grandSonIndex'
  ],
  watch: {
    openGrandSonAttr: function(v) {
      this.isOpenGrandSonAttr = v
    },
    attrTableData: function(v) {
      this.sonData = v
    },
    formData: function(v) {
      this.tableData = v
    },
    entIndex: function(v) {
      this.index = v
    },
    grandSonIndex: function(v) {
      this.sonIndex = v
    }
  },
  data() {
    return {
      index: 0,
      sonIndex: 0,
      isOpenGrandSonAttr: false,
      hideAttr: [],
      sonData: [],
      tableData: [],
      dataType: [
        {key: 'varchar', value: '字符串'},
        {key: 'number', value: '数字'},
        {key: 'date', value: '日期'},
        {key: 'clob', value: '大文本'}
      ],
      dateFormat: [
        {key: 'yyyy-MM-dd HH:mm:ss', value: 'yyyy-MM-dd HH:mm:ss'},
        {key: 'yyyy-MM-dd', value: 'yyyy-MM-dd'}
      ],
      scrollHeight:'100%'
    }
  },
  computed: {
    attrData: function() {
      const data = this.openGrandSonAttr
        ? this.sonData
        : this.formData.ents[this.entIndex].attributeList
      return data
    },
  },
  beforeDestroy() {
    //组件注销移除事件监听器，以防多次调用
    this.$root.$off('validateField')
  },
  methods: {
    //2022-09-20 ccwgq 计算高度
    computeHeight(){
      const offsetHeight=this.$refs.cardBody.offsetHeight;
      // console.log(offsetHeight);
      this.scrollHeight= offsetHeight>0? offsetHeight:300;
    },
    //校验当前实体字段
    checkEntFunc(type) {
      let checkEntFuncData = {
        type: type,
        formData: [this.formData.ents[this.entIndex]]
      }
      this.$root.$emit('validateField', checkEntFuncData)
    },
    //表单数据加载
    getFormData() {
      const this_ = this
      if (this_.formData.id) {
        form.getEntData(this_.formData.id, resp => {
          resp.data.ents.forEach((entData, index) => {
            if (entData.isExternal == '1' && index == 0) {
              entData.show = '主实体-外'
            } else if (entData.isExternal == '1') {
              entData.show = '子实体-外'
            }
            if (index === 0) {
              entData.isCheck = true
            }
            if (entData.children) {
              entData.children.forEach(v => {
                if (v.isExternal == '1') {
                  v.show = '孙实体-外'
                }
              })
            }
            for (let q = 0; q < entData.attributeList.length; q++) {
              if (entData.attributeList[q]) {
                if (entData.attributeList[q].isRequired == 0) {
                  entData.attributeList[q].isRequired = '0'
                } else {
                  entData.attributeList[q].isRequired = '1'
                }
              }
              for (let i = 0; i < entData.attributeList.length - 1 - q; i++) {
                if (
                  entData.attributeList[i].index >
                  entData.attributeList[i + 1].index
                ) {
                  let temp = entData.attributeList[i]
                  entData.attributeList[i] = entData.attributeList[i + 1]
                  entData.attributeList[i + 1] = temp
                }
              }
            }
          })
          resp.data.ents.forEach(data => {
            data.isCheck = false
          })
          //获取选中实体
          resp.data.ents[this_.entIndex].isCheck = true
          this_.$emit('update:formData', resp.data)
        })
      }
    },
    //刷新元数据
    reloadByEntId(ent) {
      let id = ent.id
      if (this.openGrandSonAttr && ent.children && ent.children.length > 0) {
        id = ent.children[this.grandSonIndex].id
      }
      let _this = this
      form.reloadByEntId(id, _this.formData.alias).then(resp => {
        if (resp.state) {
          _this.$message({
            message: '刷新成功,若字段有变化请重新拖拽字段设计表单',
            type: 'success'
          })
          _this.getFormData()
        } else {
          this.$message({message: resp.message, type: 'error'})
        }
      })
    },
    entBlur(index) {
      this.$emit('entBlur', index)
      this.checkEntFunc(true)
    },
    chineseFormat(id, list, param, index, v) {
      this.$emit('chineseFormat', id, list, param, index, v)
    },
    //新增字段
    addAttrRows() {
      let row = {
        comment: '',
        name: '',
        isRequired: '0',
        dataType: 'varchar',
        format: '',
        intLen: '',
        attrLength: 200,
        decimalLen: 0,
        isNew: true,
        defaultValue: '',
        desc: '',
        index: this.openGrandSonAttr
          ? this.sonData.length + 1
          : this.formData.ents[this.entIndex].attributeList.length + 1
      }
      if (this.openGrandSonAttr) {
        this.sonData.push(row)
      } else {
        this.formData.ents[this.entIndex].attributeList.push(row)
      }
    },
    //数据类型切换设置默认值
    defaultDataFormat(row, index) {
      let selectAttr = this.formData.ents[this.entIndex].attributeList
      if (this.openGrandSonAttr) {
        selectAttr = this.sonData
      }
      selectAttr[index].attrLength = 0
      selectAttr[index].decimalLen = 0
      selectAttr[index].format = ''
      if (row.dataType == 'date') {
        selectAttr[index].format = 'yyyy-MM-dd HH:mm:ss'
      } else if (row.dataType == 'varchar') {
        selectAttr[index].attrLength = 200
      } else if (row.dataType == 'number') {
        selectAttr[index].attrLength = 10
        selectAttr[index].decimalLen = 2
      }
    },
    handleCommand(param) {
      switch (param.command) {
        case 'del':
          this.deleteAttrRows(param.row, param.index)
          break
        case 'up':
          this.attrUp(param.row, param.index)
          break
        case 'down':
          this.attrDown(param.row, param.index)
          break
        default:
          break
      }
    },

    // 删除字段 伪删除 设置字段 status 值 hide
    isDel(row, index) {
      let count = 0
      this.formData.ents[this.entIndex].attributeList.forEach(item => {
        if (item.status === 'hide') {
          count++
        }
      })
      if (count >= this.formData.ents[this.entIndex].attributeList.length - 1) {
        this.$message({message: '最后一个字段不能删除！', type: 'warning'})
        return
      }
      if (!this.formData.deployed) {
        form
          .deleteAttr(row.id)
          .then(resp => {
            if (resp.data.state) {
              this.$message({message: resp.data.message, type: 'success'})
            } else {
              this.$message({message: resp.data.message, type: 'error'})
              return
            }
          })
          .then(() => {
            this.formData.ents[this.entIndex].attributeList.splice(index, 1)
            this.formData.ents[this.entIndex].attributeList.forEach(
              (item, attrIndex) => {
                if (attrIndex == index) {
                  item.index = item.index - 1
                  ++index
                }
              }
            )
            form.saveEntData(this.formData).then(resp => {
              if (resp.data.state) {
                this.formData.rev++
              }
            })
          })
      } else {
        form.removeAttr(row, this.formData.alias).then(resp => {
          if (resp.data.state) {
            this.$message({
              message: resp.data.message + '，建模数据已更新！',
              type: 'success'
            })
            this.$emit('getFormData')
          } else {
            this.$message({message: resp.data.message, type: 'error'})
            return
          }
        })
      }
    },
    //删除字段
    deleteAttrRows(row, index) {
      if (!this.openGrandSonAttr) {
        if (row.id == undefined) {
          this.formData.ents[this.entIndex].attributeList.splice(index, 1)
          this.formData.ents[this.entIndex].attributeList.forEach(
            (item, attrIndex) => {
              if (attrIndex == index) {
                item.index = item.index - 1
                ++index
              }
            }
          )
          return
        }
        this.isDel(row, index)
      } else {
        if (!row.id) {
          this.attrTableData.splice(index, 1)
          this.attrTableData.forEach((item, i) => {
            if (i == index) {
              item.index = item.index - 1
              ++index
            }
          })
          return
        }
        this.isDel(row, index)
      }
    },
    attrUp(row, index) {
      if (!this.openGrandSonAttr) {
        this.formData.ents[this.entIndex].attributeList[index].index =
          this.formData.ents[this.entIndex].attributeList[index].index - 1
        this.formData.ents[this.entIndex].attributeList[index - 1].index =
          this.formData.ents[this.entIndex].attributeList[index - 1].index + 1
        this.formData.ents[this.entIndex].attributeList = utils.arrayMove(
          this.formData.ents[this.entIndex].attributeList,
          row,
          'up'
        )
      } else {
        this.sonData[index].index = this.sonData[index].index - 1
        this.sonData[index - 1].index = this.sonData[index - 1].index + 1
        this.sonData = utils.arrayMove(this.sonData, row, 'up')
      }
    },
    attrDown(row, index) {
      if (!this.openGrandSonAttr) {
        this.formData.ents[this.entIndex].attributeList[index].index =
          this.formData.ents[this.entIndex].attributeList[index].index + 1
        this.formData.ents[this.entIndex].attributeList[index + 1].index =
          this.formData.ents[this.entIndex].attributeList[index + 1].index - 1
        this.formData.ents[this.entIndex].attributeList = utils.arrayMove(
          this.formData.ents[this.entIndex].attributeList,
          row,
          'down'
        )
      } else {
        this.sonData[index].index = this.sonData[index].index + 1
        this.sonData[index + 1].index = this.sonData[index + 1].index - 1
        this.sonData = utils.arrayMove(this.sonData, row, 'down')
      }
    },
    recovery(row) {
      form.recovery(row, this.formData.alias).then(resp => {
        if (resp.data.state) {
          this.$message({
            message: resp.data.message + '，建模数据已更新',
            type: 'success'
          })
          this.$emit('getFormData')
        }
      })
    },
    refreshAttr(cb) {
      let param = {
        dsalias: this.formData.ents[this.entIndex].dsName,
        isTable: '1',
        objName: this.formData.ents[this.entIndex].tableName
      }
      if (this.openGrandSonAttr) {
        param.objName = this.formData.ents[this.entIndex].children[
          this.grandSonIndex
        ].tableName
        param.dsalias = this.formData.ents[this.entIndex].children[
          this.grandSonIndex
        ].dsName
      }
      form
        .getHideAttr(param.objName)
        .then(resp => {
          if (resp) {
            this.hideAttr = resp
          }
        })
        .then(() => {
          form
            .getTableList(param)
            .then(resp => {
              this.isExit = false
              this.refreshData = resp
            })
            .then(() => {
              for (let i = 0; i < this.refreshData.data.length; i++) {
                if (this.refreshData.data[i].name == param.objName) {
                  // 删除主键和外键
                  this.$http
                    .get(
                      '${form}/bo/def/v1/reloadByEntId?entId=' +
                        this.formData.ents[this.entIndex].id
                    )
                    .then(resp => {
                      let json = JSON.parse(
                        JSON.stringify(resp.data.table.columnList)
                          .replace(/charLen/g, 'attrLength')
                          .replace(/fieldName/g, 'name')
                          .replace(/columnType/g, 'dataType')
                          .replace(/fdataType/g, 'fcolumnType')
                      )
                      let _this = this
                      let data = {}
                      if (this.hideAttr.length > 0) {
                        let attr = ''
                        this.hideAttr.forEach(v => {
                          attr += v.fieldName + ','
                        })
                        json = json.filter(value => {
                          return !attr.includes(value.fieldName)
                        })
                      }
                      if (this.openGrandSonAttr) {
                        this.formData.ents[this.entIndex].children[
                          this.grandSonIndex
                        ].attributeList = json
                        data = this.formData.ents[this.entIndex].children[
                          this.grandSonIndex
                        ]
                      } else {
                        this.formData.ents[this.entIndex].attributeList = json
                        data = this.formData.ents[this.entIndex]
                      }
                      data.attributeList = data.attributeList.filter(item => {
                        let val = item.name.toUpperCase()
                        return (
                          !item.isPk &&
                          val != 'F_FORM_DATA_REV_' &&
                          val != 'REF_ID_' &&
                          (!_this.formData.ents.fk ||
                            val != _this.formData.ents.fk.toUpperCase())
                        )
                      })
                      data.attributeList.forEach((item, index) => {
                        item.index = index + 1
                        if (item.attrLength == 0 && item.intLen != 0) {
                          item.attrLength = item.intLen
                        }
                      })
                      this.$message({message: '刷新成功', type: 'success'})
                      this.isExit = true
                    })
                  break
                }
              }
              setTimeout(() => {
                if (!this.isExit) {
                  if (this.openGrandSonAttr) {
                    this.formData.ents[this.entIndex].children[
                      this.grandSonIndex
                    ].attributeList = []
                    this.getGrandSonEntsByIndex(
                      this.grandSonIndex,
                      this.entIndex
                    )
                  } else {
                    if (this.entIndex == 0) {
                      form.removeBusinessObj(this.formData.id).then(() => {
                        this.handleDialogClose()
                      })
                    } else {
                      this.formData.ents[this.entIndex].attributeList = []
                      this.$emit('getEntsByIndex', this.entIndex)
                    }
                  }
                }
              }, 500)
              this.isExit = false
            })
        })
    }
  },
  mounted() {
    let _this = this
    document.onkeydown = function() {
      if (_this.formData.ents && _this.formData.ents.length > 0) {
        let key = window.event.keyCode
        if (key == 113) {
          //== 83 && event.ctrlKey
          _this.addAttrRows()
          setTimeout(function() {
            _this.$refs.attrTableScrollbarHeight.bodyWrapper.scrollTop =
              _this.$refs.attrTableScrollbarHeight.bodyWrapper.scrollHeight
          }, 500)
        }
      }
    }
    this.computeHeight();
  },
  updated(){
    this.$nextTick(()=>{
      this.computeHeight();
    })
  }
}
</script>

<style lang="scss" scoped>
@import '@/assets/css/element-variables.scss';

.card {
  color: $--color-text-primary;
  height: calc(100% - 10px);
  .card__header--span {
    font-weight: 700;
  }
  .card__btngroup {
    margin-left: 20px;
  }
  /deep/ .el-card__body {
    height: calc(100% - 100px);
  }
  .card__body {
    height: inherit;
  }
  .scrollbar-fullheight {
//height: 100%;
  }
}

.table-item {
  margin: 9px auto;
}
</style>
