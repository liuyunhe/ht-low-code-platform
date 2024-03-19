<template>
  <el-dialog
    title="关联链接编辑"
    :close-on-click-modal="false"
    :visible.sync="visible"
    :append-to-body="true"
    width="80%"
  >
    <div v-if="visible" style="min-height: 400px">
      <el-row :gutter="8">
        <el-col :span="10">
          <div>
            <span>使用通用模板:</span>
            <el-switch
              v-model="formData.useCommon"
              active-text="启用"
              inactive-text="关闭"
              :active-value="true"
              :inactive-value="false"
              @change="handleSwitchChange"
            ></el-switch>
          </div>
          <div v-if="formData.useCommon">
            <el-input
              :disabled="true"
              type="text"
              size="small"
              v-model="formData.commonTmp"
            ></el-input>
          </div>
          <div v-else>
            <!-- 选中某个字段 -->
            <div>
              <!-- TODO:加入tooltip提示具体操作 -->
              <el-tooltip
                placement="bottom"
                content="将根据该字段进行链接分类，不同的字段再固定给定的值使用不同的公文链接"
              >
                <i class="icon-question" style="margin-right: 5px"></i>
              </el-tooltip>
              <el-select
                v-model="selectResultField"
                placeholder="请选择分类字段"
                @change="handleSelect"
              >
                <el-option
                  v-for="(item, index) in dialogResultFields"
                  :key="index"
                  :label="item.comment"
                  :value="item.realField"
                >
                </el-option>
              </el-select>
            </div>
            <el-button-group>
              <el-button type="primary" size="mini" @click="addConfItem">
                <i class="el-icon-plus"></i><span>新增</span>
              </el-button>
              <!-- TODO:完善一键回填功能 -->
              <el-button type="info" size="mini"
              @click="oneTickBack"
              >
                <el-tooltip
                  content="将获取已有数据里该字段所有的值"
                  placement="top"
                >
                  <i class="icon-question"></i>
                </el-tooltip>
                <span>一键回填</span>
              </el-button>
            </el-button-group>
            <!-- tableData -->
            <el-table
              ref="table"
              fit
              :data="formData.linkingConf"
              @row-click="linkRowClick"
            >
              <el-table-column
                label="序号"
                type="index"
                align="center"
              ></el-table-column>
              <el-table-column label="字段" align="center">
                <template slot-scope="scope">
                  <div>{{ scope.row.field }}</div>
                </template>
              </el-table-column>
              <el-table-column show-overflow-tooltip label="值" align="center">
                <template slot-scope="scope">
                  <el-input type="text" v-model="scope.row.value"></el-input>
                </template>
              </el-table-column>
              <el-table-column show-overflow-tooltip align="center">
                <template slot="header">
                  <div>
                    <el-tooltip
                      content="点击此单元格即可编辑模板"
                      placement="top"
                    >
                      <i class="icon-question"></i>
                    </el-tooltip>
                    <span style="margin-left: 8px">链接模板</span>
                  </div>
                </template>
                <template slot-scope="scope">
                  <el-tag :type="validateTemplate(scope.row.linkTmp)">
                    {{ scope.row.linkTmp }}
                  </el-tag>
                </template>
              </el-table-column>
              <el-table-column label="操作" align="center">
                <template slot-scope="scope">
                  <!-- <el-button type="text" @click="currentRow=scope.row">编辑</el-button> -->
                  <el-button
                    type="text"
                    style="color: red"
                    @click="removeConfItem(scope.row)"
                    >删除</el-button
                  >
                </template>
              </el-table-column>
            </el-table>
          </div>
        </el-col>
        <el-col :span="14">
          <div v-show="!disabledEditor">
            <codemirror
              ref="editor"
              v-model="currentTemplate"
              class="url-editor"
              placeholder="Code goes here..."
              :options="cmOptions"
              :style="{height: '100px'}"
              :autofocus="true"
              id="singleText"
              @change="changeTemplate"
            ></codemirror>
          </div>
          <div class="result-field-container" style="margin: 20px 0">
            <el-scrollbar style="height: 150px">
              <ul class="result-field--list">
                <li
                  v-for="(field, index) in dialogResultFields"
                  :key="index"
                  @click="pickField(field)"
                >
                  {{ field.comment }}
                </li>
              </ul>
            </el-scrollbar>
          </div>
        </el-col>
      </el-row>
    </div>
    <template slot="footer">
      <span>
        <el-button type="primary" @click="confirmDialog">确定</el-button>
        <el-button type="danger" @click="visible = false">关闭</el-button>
      </span>
    </template>
  </el-dialog>
</template>
<script>
import {codemirror} from 'vue-codemirror'
import {cloneDeep} from 'lodash'
import { Message } from 'element-ui'
require('codemirror/mode/python/python.js')
require('codemirror/addon/fold/foldcode.js')
require('codemirror/addon/fold/foldgutter.js')
require('codemirror/addon/fold/brace-fold.js')
require('codemirror/addon/fold/xml-fold.js')
require('codemirror/addon/fold/indent-fold.js')
require('codemirror/addon/fold/markdown-fold.js')
require('codemirror/addon/fold/comment-fold.js')
export default {
  name: 'RelativeLinkDialog',
  props: ['linkItem','data'],
  data() {
    return {
      visible: false,
      dialogResultFields: [], //对话框的返回字段
      selectResultField: '',
      formData:cloneDeep(this.tempData),
      tempData:null,
      currentTemplate: '',
      currentRow: {
        linkTmp: '',
      },
      useCommon: false, //使用通用链接
      cmOptions: {
        showCursorWhenSelecting: true,
        value: '',
        mode: 'code',
        // readOnly: false,
        smartIndent: true,
        tabSize: 2,
        theme: 'base16-light',
        lineNumbers: true,
        line: true,
        autofocus: true,
        inputStyle: 'textarea',
        disabled: this.disabledEditor,
      },
    }
  },
  computed: {
    disabledEditor() {
      if (this.formData.useCommon) {
        return false
      } else {
        console.log(this.formData)
        return this.indexArray(this.formData.linkingConf, this.currentRow) == -1
      }
    },
  },
  watch: {
    currentTemplate: function (val) {
      if (this.formData.useCommon) {
        this.formData.commonTmp = val
      }
      const index = this.indexArray(this.formData.linkingConf, this.currentRow)
      this.formData.linkingConf[index].linkTmp = val
    },
    tempData(val){
      this.formData=cloneDeep(val);
    }
  },
  methods: {
    //打开对话框
    handleOpen() {
      this.visible = true
    },
    handleSwitchChange(val) {
      if (val) {
        this.currentTemplate = this.formData.commonTmp
      }
    },
    //选中分类字段时的回调
    handleSelect(value) {
      this.formData.selectTypeField=value;
      // console.log(value)
      const list = this.formData.linkingConf
      if (typeof list === 'object' && list instanceof Array) {
        list.forEach((item) => {
          item.field = value
        })
      }
    },
    //光标插入
    async insert(myValue, lineIndex) {
      const myField = this.$refs.editor

      myField.codemirror.replaceSelection(myValue)
      let line = myField.codemirror.doc.getCursor()
      if (lineIndex) {
        line.ch = line.ch - lineIndex
        myField.codemirror.doc.setCursor(line)
      }
      myField.codemirror.display.input.focus()
    },
    //确定
    confirmDialog(){
      // this.tempData=this.formData;
      // this.formData=cloneDeep(this.formData);
      //TODO:完成必要的校验
      Message.success('编辑成功')
      this.visible=false;
    },
    oneTickBack(){
      let url="${form}/form/customDialog/v1/getListData?alias="
      +this.data.options.customDialogjson.custDialog.alias
      +"&mapParam=";
      this.$http.post(url,{
        pageBean:{
          page:1,
          pageSize:100000
        }
      })
      .then((resp)=>{console.log(resp)})
    },
    validateTemplate(value) {
      if (!value) return 'info'
      else return 'success'
    },
    //点击表格中的一行
    linkRowClick(row, column, event) {
      //TODO:万一点击了删除按钮怎么办？？？，直接返回，不做选中操作
      console.log(row, column, event)
      const index = this.indexArray(this.formData.linkingConf, row)
      this.$nextTick(() => {
        const $rows = $(this.$refs.table.$el).find('.el-table__row')
        $rows.eq(index).addClass('row--checked')
        $rows.each(function ($index) {
          if ($index == index) {
            $(this).addClass('row--checked')
          } else {
            $(this).removeClass('row--checked')
          }
        })
        // console.log($rows)
      })
      this.currentRow = row
      this.currentTemplate = row.linkTmp
    },
    //编辑器change回调
    changeTemplate(value) {
      console.log(value)
    },
    //点击字段后返回
    pickField(field) {
      // console.log(field)
      const value = field.realField
      const str = '${' + value + '}'
      this.insert(str)
      // this.currentTemplate += str
    },
    //添加一项
    addConfItem() {
      const obj = {
        field: !this.selectResultField ? '' : this.selectResultField, //从返回数据中的字段取出一个值
        value: '', //字段的值
        linkTmp: '',
      }
      this.formData.linkingConf.push(obj)
    },
    //移除linkConf数组中的一项
    removeConfItem(row) {
      const list = this.formData.linkingConf
      if (list && list.length) {
        const index = this.indexArray(list, row)
        list.splice(index, 1)
      }
    },
    //返回数组元素的下标
    indexArray(array, item) {
      if (array.length == 0) {
        return -1
      }
      for (let i = 0; i < array.length; i++) {
        if (JSON.stringify(array[i]) == JSON.stringify(item)) {
          return i
        }
      }
      return -1
    },
  },
}
</script>
<style lang="scss" scope>
$fontSize: 11pt;
$checkedColor: #26dbe5;

.vue-codemirror > div {
  height: inherit !important;
}

.CodeMirror {
  height: 100px !important;
}

.result-field-container {
  // border: 1px solid black;
}

.result-field--list {
  // border: 1px solid black;
  list-style: none;

  li {
    font-size: $fontSize;
    height: 30px;
    line-height: 30px;

    &:hover {
      background-color: #f5f5f5;
      cursor: pointer;
    }
  }
}

.row--checked {
  background-color: $checkedColor;

  td {
    background-color: $checkedColor;
  }

  &:hover {
    td {
      background-color: $checkedColor !important;
    }
  }
}
</style>