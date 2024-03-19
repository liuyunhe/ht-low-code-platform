<template>
  <el-container>
    <el-row :gutter="20" style="width: 100%">
      <el-col :span="7">
        <el-table
          ref="displaySettingTable"
          border
          :max-height="tabHeight"
          :data="displaySettingFields"
          tooltip-effect="dark"
          @row-dblclick="fillToDisplay"
        >
          <el-table-column type="selection" width="55"></el-table-column>
          <el-table-column
            prop="name"
            label="列名"
            class="is-required"
            show-overflow-tooltip
          ></el-table-column>
          <el-table-column
            prop="desc"
            label="注释"
            show-overflow-tooltip
          ></el-table-column>
          <el-table-column
            prop="type"
            label="类型"
            width="80"
          ></el-table-column>
        </el-table>
      </el-col>
      <el-col :span="1">
        <el-button
          type="primary"
          circle
          icon="icon-hide"
          title="将所选字段添加为显示字段"
          style="-webkit-transform: rotate(270deg); transform: rotate(270deg)"
          @click="allFillToDisplay()"
        />
      </el-col>
      <el-col :span="16">
        <el-table
          ref="displayTable"
          border
          :max-height="tabHeight"
          :data="displayFields"
          tooltip-effect="dark"
          style="width: 100%"
          @selection-change="handleSelectionChange"
        >
          <el-table-column type="selection" width="55"> </el-table-column>
          <el-table-column
            label="序号"
            type="index"
            width="50"
          ></el-table-column>
          <el-table-column prop="name" label="列名" width="200">
            <template slot-scope="scope">
              <span v-if="!scope.row.customColumn">{{ scope.row.name }}</span>
              <ht-input
                v-if="scope.row.customColumn"
                v-model="scope.row.name"
                placeholder="请输入列表内容"
                validate="required"
                style="width: 50%; margin-right: 3px"
              ></ht-input>
              <el-button
                v-if="scope.row.customColumn"
                @click="sqlDialogShow(scope.row)"
                size="mini"
                >配置SQL</el-button
              >
            </template>
          </el-table-column>
          <el-table-column prop="desc" label="注释" width="135">
            <template slot-scope="scope">
              <el-input
                v-model="scope.row.desc"
                placeholder="请输入字段注释"
                :maxlength="50"
                show-word-limit
              ></el-input>
            </template>
          </el-table-column>
          <el-table-column
            prop="right"
            :render-header="rightRenderHeader"
            label="显示权限"
            width="220"
          >
            <template slot-scope="scope">
              <span>{{ rightToDesc(scope.row.right) }}</span>
              <span style="float: right">
                <el-button
                  size="small"
                  @click="setFieldRightDialog(scope.row)"
                  icon="el-icon-edit"
                ></el-button>
              </span>
            </template>
          </el-table-column>
          <el-table-column label="管理">
            <template slot="header">
              <span style="margin-right: 10px">管理</span>
              <el-button type="primary" @click="addCustomColumn" size="mini">
                添加
              </el-button>
              <el-button type="danger" @click="delCustomColumn" size="mini">
                删除
              </el-button>
            </template>
            <template slot-scope="scope">
              <el-button
                v-if="
                  (scope.row.urlType && scope.row.urlType != 'noUrl') ||
                  (scope.row.ruleSettings &&
                    scope.row.ruleSettings.length > 0) ||
                  scope.row.openType ||
                  (scope.row.formatterData &&
                    scope.row.formatterData.length > 0)
                "
                type="primary"
                @click="setting(scope.row)"
                size="small"
              >
                设置
              </el-button>
              <el-button
                v-if="
                  (!scope.row.urlType || scope.row.urlType == 'noUrl') &&
                  ((scope.row.ruleSettings &&
                    scope.row.ruleSettings.length == 0) ||
                    !scope.row.formatterData) &&
                  !scope.row.openType &&
                  ((scope.row.formatterData &&
                    scope.row.formatterData.length == 0) ||
                    !scope.row.formatterData)
                "
                @click="setting(scope.row)"
                size="small"
              >
                设置
              </el-button>
              <el-button
                @click="sort(scope.$index, 'down')"
                size="small"
                icon="el-icon-arrow-down"
                plain
              ></el-button>
              <el-button
                @click="sort(scope.$index, 'up')"
                size="small"
                icon="el-icon-arrow-up"
                plain
              ></el-button>
              <el-button
                :plain="scope.row.mpDisplay === btnType.notShow"
                class="mobile-btn"
                :class="{
                  'is-active__btn': scope.row.mpDisplay === btnType.isShow,
                }"
                v-show="
                  scope.row.mpDisplay
                    ? (scope.row.mpDisplay = scope.row.mpDisplay)
                    : initMpDisplay(scope.row)
                "
                @click="btnChange(scope.row)"
                >移动端</el-button
              >
              <el-button
                @click="remove(scope.$index)"
                type="danger"
                size="small"
                icon="el-icon-delete"
                plain
              ></el-button>
            </template>
          </el-table-column>
        </el-table>
      </el-col>
    </el-row>
    <!-- 选择对话框  -->
    <eip-auth-dialog
      ref="eipAuthDialog"
      name="eipAuthDialog"
      @onConfirm="authDialogOnConfirm"
      append-to-body
    />
    <el-dialog
      title="设置"
      width="60%"
      append-to-body
      :visible.sync="settingVisible"
      :close-on-click-modal="false"
    >
      <el-tabs v-model="activeName" type="card">
        <el-tab-pane label="格式化设置" name="formatter">
          <el-button
            type="primary"
            style="margin-bottom: 10px; margin-right: 10px"
            @click="addSetting"
            >添加</el-button
          >
          <el-tag
            >类似固定选项的方式配置实际值和显示内容的映射关系，例如：实际值为：0，显示内容为：男士；实际值为：1，显示内容为：女士</el-tag
          >
          <el-table :data="selectedRow.formatterData" border>
            <el-table-column label="实际值">
              <template slot-scope="scope">
                <el-input
                  v-model="scope.row.key_"
                  :maxlength="50"
                  show-word-limit
                />
              </template>
            </el-table-column>
            <el-table-column label="显示内容">
              <template slot-scope="scope">
                <el-input
                  v-model="scope.row.value_"
                  :maxlength="50"
                  show-word-limit
                />
              </template>
            </el-table-column>
            <el-table-column label="操作">
              <template slot-scope="scope">
                <el-button
                  icon="el-icon-delete"
                  @click="removeSetting(scope.$index)"
                />
              </template>
            </el-table-column>
          </el-table>
        </el-tab-pane>
        <el-tab-pane label="设置链接" name="url">
          <table class="form-table" cellspacing="0" cellpadding="0" border="0">
            <tbody>
              <tr>
                <td>链接类型</td>
                <td>
                  <el-radio-group v-model="selectedRow.urlType">
                    <el-radio label="edit">查询明细</el-radio>
                    <el-radio label="reportForm">选择其它报表</el-radio>
                    <el-radio label="url">URL地址</el-radio>
                    <el-radio label="noUrl">无链接</el-radio>
                  </el-radio-group>
                </td>
              </tr>
              <tr v-if="selectedRow.urlType == 'url'">
                <td>内容</td>
                <td>
                  <el-input
                    v-model="selectedRow.url"
                    placeholder="请输入url地址"
                  />
                </td>
              </tr>
            </tbody>

            <tbody v-if="selectedRow.urlType == 'reportForm'">
              <tr>
                <td>选择报表</td>
                <td>
                  <ht-input
                    type="text"
                    @focus="showDataTemplateDialog"
                    placeholder="请选择报表"
                    v-model="reportName"
                  >
                    <el-button
                      slot="append"
                      type="primary"
                      icon="el-icon-search"
                      @click="showDataTemplateDialog"
                      >选择</el-button
                    >
                  </ht-input>
                </td>
              </tr>
              <tr v-if="conditionField.length > 0">
                <td>参数关系</td>
                <td>
                  <el-table :data="conditionField">
                    <el-table-column :label="data.data.name">
                      <template slot-scope="scope">
                        <ht-select
                          v-model="scope.row.parameter"
                          :props="{key: 'name', value: 'desc'}"
                          :options="displayFields"
                        >
                        </ht-select>
                      </template>
                    </el-table-column>
                    <el-table-column :label="reportName">
                      <template slot-scope="scope">
                        <ht-select
                          v-model="scope.row.key"
                          :options="conditionField"
                        >
                        </ht-select>
                      </template>
                    </el-table-column>
                  </el-table>
                </td>
              </tr>
            </tbody>
            <tbody v-if="selectedRow.urlType == 'url'">
              <tr>
                <td>追加参数</td>
                <td>
                  <table
                    class="form-table"
                    cellspacing="0"
                    cellpadding="0"
                    border="0"
                  >
                    <tbody>
                      <tr class="linkageTable-tr">
                        <td width="120px">参数名</td>
                        <td width="120px">取值列</td>
                        <td width="120px">
                          操作
                          <el-button
                            size="small"
                            icon="el-icon-plus"
                            @click="urlParamsAdd()"
                          ></el-button>
                        </td>
                      </tr>
                      <tr
                        class="linkageTable-tr"
                        v-for="(uparam, index) in urlParams"
                        :key="index"
                      >
                        <td>
                          <el-input
                            size="mini"
                            type="text"
                            v-model="uparam.name"
                            :maxlength="50"
                            show-word-limit
                          />
                        </td>
                        <td>
                          <ht-select
                            v-model="uparam.field"
                            :options="displaySettingFields"
                            clearable
                            filterable
                            :props="{key: 'name', value: 'desc'}"
                          />
                        </td>
                        <td>
                          <el-button
                            size="small"
                            icon="el-icon-plus"
                            @click="urlParamsAdd()"
                          ></el-button>
                          <el-button
                            icon="el-icon-delete"
                            @click="urlParamsRemove(uparam)"
                          ></el-button>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </td>
              </tr>
            </tbody>
            <tbody v-if="selectedRow.urlType != 'noUrl'">
              <tr>
                <td>打开方式</td>
                <td>
                  <el-radio-group v-model="selectedRow.openType">
                    <el-radio label="old">当前页面打开</el-radio>
                    <el-radio label="new">新窗口打开</el-radio>
                  </el-radio-group>
                </td>
              </tr>
            </tbody>
          </table>
        </el-tab-pane>
        <el-tab-pane label="显示设置" name="showSetting">
          <el-button
            type="primary"
            @click="addProSetting"
            style="margin-right: 5px"
            >添加</el-button
          >
          <span style="margin-right: 3px" v-if="selectedRow.type == 'number'"
            >进度条</span
          >
          <el-switch
            v-model="proSetting2"
            v-if="selectedRow.type == 'number'"
            @change="proSwitchChange"
            style="margin-right: 5px"
          >
          </el-switch>
          <ht-radio
            v-model="selectedRow.ruleSetting"
            v-if="proSetting2"
            :options="calOptions"
          />
          <el-input-number
            v-model="selectedRow.diyProRule"
            v-if="proSetting2"
            :controls="false"
            size="mini"
            @change="diyProRuleChange"
          />
          <br />
          <el-table
            :data="selectedRow.ruleSettings"
            border
            style="margin-top: 3px"
          >
            <el-table-column label="文字颜色">
              <template slot-scope="scope">
                <el-color-picker v-model="scope.row.proColor" />
              </template>
            </el-table-column>
            <el-table-column label="规则设置">
              <template slot-scope="scope">
                <!--<el-input v-model="scope.row.proRule" />-->
                <el-button
                  @click="
                    showRuleSettingDialog(scope.row.proRule, scope.$index)
                  "
                  >规则设置</el-button
                >
              </template>
            </el-table-column>
            <el-table-column label="操作">
              <template slot-scope="scope">
                <el-button
                  icon="el-icon-delete"
                  @click="removeProSetting(scope.$index)"
                />
              </template>
            </el-table-column>
          </el-table>
          <span style="color: red" class="is-required">
            注：若多条规则均返回true时，采用最后一条规则的文字颜色。
          </span>
        </el-tab-pane>
      </el-tabs>

      <span slot="footer" class="dialog-footer">
        <el-button type="primary" @click="dialogOk" size="medium"
          >确 定</el-button
        >
        <el-button @click="cancelSetting" size="medium">取 消</el-button>
      </span>
    </el-dialog>

    <el-dialog
      title="配置SQL"
      :visible.sync="sqlConfigDialog"
      append-to-body
      :close-on-click-modal="false"
    >
      <el-input type="textarea" v-model="sql" />
      <div>
        此处写的SQL，会动态的插入到原执行SQL语句中，故请详细阅读规则:<br />
        <span>①</span
        >因为SQL拼接位置为SELECT当中，语句最前面需要拼接一个逗号。<br />
        <span>②</span>如果需要涉及到连表查询，关联字段需要加个t.***。<br />
        <span>③</span>最后取别名的时候一定要取与列的列名（name）一样的。<br />
        <span>④</span>查询字段不要用*，只查询一个字段。<br />
        <span style="color:red">⑤ORACLE数据库列名要用大写，pgsql数据库列名要用小写。</span><br/>
        <span class="is-required">参考案例:</span>
        <span style="margin-left: 10px"
          >,( SELECT uc_user.account_ FROM uc_user WHERE uc_user.id_ = '1' )
          userAccount
        </span>
      </div>
      <div slot="footer" class="dialog-footer">
        <el-button
          @click="
            sqlConfigDialog = false
            sql = ''
          "
          >取 消</el-button
        >
        <el-button type="primary" @click="sqlConfigOk()">确定</el-button>
      </div>
    </el-dialog>

    <el-dialog
      title="配置规则"
      :visible.sync="isShowRuleSettingDialog"
      append-to-body
      class="urgent-text"
      :close-on-click-modal="false"
      :destroy-on-close="true"
    >
      <div style="margin-top: 10px; margin-bottom: 25px">
        <code>
          <span style="color: red; margin-left: 15px"
            >编辑的脚本内容会直接填充到function(data){...}里面；data是表单数据对象，可以通过data.{显示字段列名}来获取字段的值。</span
          >
          <br />
          <span style="color: red; margin-left: 15px"
            >返回true时按此规则的文字颜色来显示。</span
          >
          <br />
          <span style="color: red; margin-left: 15px">
            例如： if(data.fieldName && data.fieldName == '张三' ){ return true;
            }else{ return false; }
          </span>
        </code>
      </div>
      <div style="width: 100%; height: 100%">
        <codemirror
          ref="scriptText"
          v-model="dialogRuleData"
          :options="cmOptions"
          class="code"
          style="width: 99%; height: 100%"
        ></codemirror>
      </div>
      <div slot="footer" class="dialog-footer">
        <el-button type="primary" @click="methodOk()">确 定</el-button>
        <el-button @click="isShowRuleSettingDialog = false">取 消</el-button>
      </div>
    </el-dialog>

    <eip-data-template-dialog
      :appendToBody="true"
      ref="dataTemplateDialog"
      :single="true"
      @onConfirm="onDataTemplateConfirm"
    ></eip-data-template-dialog>
  </el-container>
</template>

<script>
const eipAuthDialog = () => import('@/components/dialog/EipAuthDialog.vue')
const EipDataTemplateDialog = () =>
  import('@/components/dialog/EipDataTemplateDialog.vue')
const BTN_TYPE = {
  isShow: '1',
  notShow: '2',
}
export default {
  components: {
    eipAuthDialog,
    EipDataTemplateDialog,
  },
  name: 'display-setting',
  props: ['data'],
  data() {
    return {
      btnType:BTN_TYPE,//移动端显示隐藏按钮
      activeName: 'formatter',
      reportName: '',
      conditionField: [],
      dataTemplate: {},
      displaySettingFields: [],
      displayFields: [],
      permissionMap: {},
      permissionList: [],
      rightList: [
        {key: '', value: '请选择'},
        {key: 'none', value: '无'},
        {key: 'everyone', value: '所有人'},
      ],
      tabHeight: `${document.documentElement.clientHeight}` - 245,
      currentAuthRow: null,
      settingVisible: false,
      selectedRow: {},
      proSetting2: true,
      formFieldList: [],
      urlParams: [],
      defaultRight: '[{"type":"everyone","id":"","name":"","script":""}]',
      sqlConfigDialog: false,
      sql: '',
      sqlConfigRow: {},
      isShowRuleSettingDialog: false,
      cmOptions: {
        value: '        ',
        mode: 'javascript',
        readOnly: false,
        tabSize: 3,
        theme: 'base16-light',
        lineNumbers: true,
        line: true,
      },
      diyScript: '',
      ruleSettingIndex: '',
      dialogRuleData: '',
      multipleSelection: [],
      rightLab: '',
    }
  },
  computed: {
    calOptions: function () {
      return [
        {key: 100, value: '按100计算'},
        {key: 10, value: '按10计算'},
        {key: 1, value: '按1计算'},
        {key: this.selectedRow.diyProRule, value: '输入统计总数'},
      ]
    },
  },
  mounted() {
    if (this.data.bpmDataTemplate.displayField) {
      let displayFields = JSON.parse(this.data.bpmDataTemplate.displayField)
      for (let i = 0; i < displayFields.length; i++) {
        if (!displayFields[i].formatterData) {
          displayFields[i].formatterData = []
        }
        if (!displayFields[i].ruleSettings) {
          displayFields[i].ruleSettings = []
        }
      }
      this.data.bpmDataTemplate.displayField = JSON.stringify(displayFields)
    }
    this.dataTemplate = this.data.bpmDataTemplate
    this.displaySettingFields = [...this.data.fields]
    this.templates = this.data.templates
    this.permissionMap = this.data.permissionList
    this.initData()
  },
  methods: {
    btnChange(row){
      this.$set(row,'mpDisplay',row.mpDisplay==='1' ? '2' : '1')
    },
    dialogOk() {
      var conditionField = this.conditionField
      let isDislogClose = true
      this.selectedRow.parameter = []
      conditionField.forEach((item) => {
        this.selectedRow.parameter.push({
          property: item.key,
          value: item.parameter,
          group: 'main',
          operation: item.qt,
          relation: 'AND',
        })
      })
      if (this.selectedRow.urlType == 'url' && this.urlParams) {
        this.urlParams.forEach((param) => {
          const paramText = /^[a-zA-Z][a-zA-Z0-9]+$/
          if (!paramText.test(param.name)) {
            isDislogClose = false
            this.$message.warning('参数名称格式有误')
          }
        })
        if (isDislogClose) {
          this.selectedRow.urlParams = [...this.urlParams]
          this.urlParams = []
        }
      }
      if (isDislogClose) {
        this.settingVisible = false
      }
    },
    onDataTemplateConfirm(selectedNode) {
      if (selectedNode && selectedNode.length > 0) {
        this.$nextTick(() => {
          this.conditionField = []
          var conditionField = JSON.parse(selectedNode[0].conditionField)
          conditionField.forEach((item) => {
            var obj = {
              key: item.colPrefix + item.name,
              parameter: '',
              qt: item.qt,
              value: item.cm,
            }
            this.conditionField.push(obj)
          })
          this.reportName = selectedNode[0].name
          this.selectedRow.reportNameConfigure = {
            alias: selectedNode[0].alias,
            reportName: selectedNode[0].name,
            conditionField: this.conditionField,
          }
        })
      } else {
        this.reportName = ''
        this.conditionField = []
        this.selectedRow.reportNameConfigure = {}
      }
    },
    //保存显示列数据
    saveDisplayField() {
      this.dataTemplate.displayField = this.displayFields
        ? JSON.stringify(this.displayFields)
        : null
    },
    validateDisplayField() {
      for (let i = 0; i < this.displayFields.length; i++) {
        if (this.displayFields[i].customColumn && !this.displayFields[i].name) {
          this.$message.warning(`请完善显示字段第${i + 1}列虚拟字段的列名`)
          return false
        }
      }
      return true
    },
    //初始化处理
    initData() {
      if (this.dataTemplate.displayField) {
        this.displayFields = JSON.parse(this.dataTemplate.displayField)
      }
      if (this.permissionMap) {
        for (let key in this.permissionMap) {
          this.permissionList.push({
            type: key,
            title: this.permissionMap[key],
          })
        }
      }
      if (this.dataTemplate.formField) {
        this.formFieldList = []
        const formFieldList = JSON.parse(this.dataTemplate.formField)
        let fieldMap = {}
        let _this = this
        formFieldList.forEach((ffield) => {
          if (!fieldMap[ffield.name]) {
            _this.formFieldList.push(ffield)
            fieldMap[ffield.name] = true
          }
        })
      }
    },
    showDataTemplateDialog() {
      this.$refs.dataTemplateDialog.showDialog()
    },
    columnFilter(type) {
      return type != 'sub' && type != 'tabs'
    },
    //双击字段列表中的字段时将该字段加入到显示字段
    fillToDisplay(row, event, column) {
      let isIn = this.isInDisplayFields(row.name)
      if (!isIn) {
        let fileds = {
          name: row.name,
          desc: row.desc,
          type: row.type,
          showFlowField: row.showFlowField,
          right: this.defaultRight,
        }
        this.displayFields.push(fileds)
      }
    },
    //将字段列表中的已选字段加入到显示字段列表
    allFillToDisplay() {
      let selectrows = this.$refs.displaySettingTable.store.states.selection
      if (!selectrows || selectrows.length < 1) {
        this.$message({
          message: '请在左侧列表中选择要显示的字段',
          type: 'warning',
        })
      }
      selectrows.forEach((obj) => {
        if (!this.isInDisplayFields(obj.name)) {
          let fileds = {
            name: obj.name,
            desc: obj.desc,
            type: obj.type,
            showFlowField: obj.showFlowField,
            right: this.defaultRight,
          }
          this.displayFields.push(fileds)
        }
      })
    },
    //打开设置权限
    setFieldRightDialog(row) {
      let conf = {
        right: JSON.parse(row.right),
        permissionList: this.permissionList,
      }
      this.currentAuthRow = row
      this.$refs.eipAuthDialog.showDialog(conf)
    },
    //设置权限
    authDialogOnConfirm(data) {
      if (this.currentAuthRow) {
        this.currentAuthRow.right = JSON.stringify(data)
      }
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
          let temp = this.displayFields[index - 1]
          this.$set(this.displayFields, index - 1, this.displayFields[index])
          this.$set(this.displayFields, index, temp)
        }
      } else {
        if (index === this.displayFields.length - 1) {
          this.$message({
            message: '已经是列表中最后一位',
            type: 'warning',
          })
        } else {
          let i = this.displayFields[index + 1]
          this.$set(this.displayFields, index + 1, this.displayFields[index])
          this.$set(this.displayFields, index, i)
        }
      }
    },

    //删除显示字段
    remove(index) {
      this.displayFields.splice(index, 1)
    },
    //判断字段是否已在显示字段列表中
    isInDisplayFields(name) {
      let isIn = false
      if (this.displayFields && this.displayFields.length > 0) {
        this.displayFields.forEach((obj) => {
          if (obj.name == name) {
            isIn = true
            return
          }
        })
      }
      return isIn
    },
    //显示权限信息
    rightToDesc(right) {
      if (right) {
        right = JSON.parse(right)
      } else {
        return '无'
      }
      let desc = ''
      let _this = this
      right.forEach((r) => {
        if (desc) {
          desc += ' 和 '
        }
        var str = _this.permissionMap[r.type]
        if (r.name) {
          str += ':' + r.name
        } else if (r.id) {
          str += ':' + r.id
        }
        desc += str
      })
      return desc
    },
    //标题统一权限设置
    rightRenderHeader(h, para) {
      //下拉框选项
      let _this = this
      let rights = [
        {key: '', value: '请选择'},
        {key: 'none', value: '无'},
        {key: 'everyone', value: '所有人'},
      ]
      let rightMap = {'': '请选择', none: '无', everyone: '所有人'}
      //下拉框内容包裹在一个div里面
      return h('div', {}, [
        h(
          'span',
          {
            //div里面有一个文字提示：下拉框所属内容
            style: {},
            class: 'level-font-class',
          },
          para.column.label
        ),
        h(
          'el-select',
          {
            //el-select实现下拉框
            size: 'mini',
            style: {
              width: '120px',
              marginLeft: '10px',
            },
            on: {
              input: (value) => {
                //随着下拉框的不同，文字框里的内容在边
                _this.rightLab = rightMap[value]
                if (
                  value &&
                  _this.displayFields &&
                  _this.displayFields.length > 0
                ) {
                  _this.displayFields.forEach((field) => {
                    if (field.right) {
                      field.right = JSON.parse(field.right)
                    }
                    if (field.right[0].hasOwnProperty('v')) {
                      field.right[0] = {v: value}
                    } else {
                      field.right[0] = {type: value}
                    }
                    field.right = JSON.stringify(field.right)
                  })
                }
              },
            },
            props: {
              value: _this.rightLab, //文字框的内容取决于这个value，如果value不存在，会报错
            },
          },
          [
            //下拉框里面填充选项，通过rights遍历map，为每一个选项赋值。
            rights.map((item) => {
              return h('el-option', {
                props: {
                  value: item.key,
                  label: item.value,
                },
              })
            }),
          ]
        ),
      ])
    },
    setting(row) {
      this.settingVisible = true
      this.selectedRow = row
      if (this.selectedRow.reportNameConfigure) {
        this.reportName = this.selectedRow.reportNameConfigure.reportName
        this.conditionField =
          this.selectedRow.reportNameConfigure.conditionField == undefined
            ? []
            : this.selectedRow.reportNameConfigure.conditionField
      }
      if (!this.selectedRow.ruleSettings) {
        this.selectedRow.ruleSettings = []
      }
      this.selectedRow.diyProRule = 0
      if (!this.selectedRow.formatterData) {
        this.selectedRow.formatterData = []
      }
      /* this.selectedRow.ruleSetting = 100;*/
      if (this.selectedRow.proSetting) {
        this.proSetting2 = true
      } else {
        this.selectedRow.proSetting = false
        this.proSetting2 = false
      }
      if (
        this.selectedRow.urlType == 'url' &&
        this.selectedRow.urlParams &&
        this.selectedRow.urlParams.length > 0
      ) {
        this.urlParams = [...this.selectedRow.urlParams]
      }
    },
    addSetting() {
      this.selectedRow.formatterData.push({
        key_: '',
        value_: '',
      })
    },
    removeSetting(index) {
      this.selectedRow.formatterData.splice(index, 1)
    },
    removeProSetting(index) {
      this.selectedRow.ruleSettings.splice(index, 1)
    },
    cancelSetting() {
      this.settingVisible = false
      this.selectedRow.formatterData = []
    },
    urlParamsAdd() {
      this.urlParams.push({name: '', field: ''})
    },
    urlParamsRemove(item) {
      this.urlParams.remove(item)
    },
    initMpDisplay(row) {
      this.$set(row, 'mpDisplay', '2')
    },
    // 添加自定义列值
    addCustomColumn() {
      this.displayFields.push({
        desc: '',
        name: '',
        right: '[{"type":"everyone","id":"","name":"","script":""}]',
        showFlowField: true,
        type: 'varchar',
        sql: '',
        customColumn: true,
      })
    },
    delCustomColumn() {
      const names = this.multipleSelection.map((item) => item.name)
      this.displayFields = this.displayFields.filter(
        (item) => !names.includes(item.name)
      )
    },
    sqlDialogShow(row) {
      this.sqlConfigDialog = true
      this.sqlConfigRow = row
      if (row.sql) {
        this.sql = row.sql
      }
    },
    sqlConfigOk() {
      this.displayFields.forEach((field) => {
        if (field.name == this.sqlConfigRow.name) {
          field.sql = this.sql
          this.sql = ''
        }
      })
      this.sqlConfigDialog = false
    },
    //添加显示设置
    addProSetting() {
      this.selectedRow.ruleSettings.push({
        proColor: '',
        proRule: '',
      })
    },
    //弹窗规则设置对话框
    showRuleSettingDialog(proRule, index) {
      this.ruleSettingIndex = index
      this.dialogRuleData = proRule
      this.isShowRuleSettingDialog = true
    },
    diyScriptChange(myValue) {
      var cm = this.$refs.scriptText.codemirror
      var doc = cm.getDoc()
      var cursor = doc.getCursor() //gets the line number in the cursor position
      var line = doc.getLine(cursor.line) //get the line contents
      var pos = {
        line: cursor.line,
        ch: line.length - 1, //set the character position to the end of the line
      }
      doc.replaceRange('  ' + myValue + '  ', pos) //adds a new line
    },
    methodOk() {
      this.selectedRow.ruleSettings[
        this.ruleSettingIndex
      ].proRule = this.dialogRuleData
      this.dialogRuleData = ''
      this.isShowRuleSettingDialog = false
    },
    proSwitchChange(data) {
      this.selectedRow.proSetting = data
      if (data) {
        this.selectedRow.diyProRule = 0
      }
    },
    diyProRuleChange(val) {
      this.$set(this.selectedRow, 'diyProRule', val)
      if (val == 1 || val == 10 || val == 100) {
        this.$set(this.selectedRow, 'diyProRule', 0)
      }
      this.$set(this.selectedRow, 'ruleSetting', val)
    },
    handleSelectionChange(val) {
      this.multipleSelection = val
    },
  },
}
</script>
<style lang="scss" scoped>
.table > thead > tr > th,
.table > thead > th,
.table > tr > th,
.table > tfoot > tr > th,
.table > thead > tr > td,
.table > tr > td,
.table > tfoot > tr > td {
  border-top: 1px solid #e7eaec;
  border-left: 1px solid #e7eaec;
  line-height: 1.42857;
  padding: 4px 8px;
  vertical-align: middle;
  text-align: center;
}
.el-table >>> .el-radio-group {
  margin-left: 10px;
  margin-right: 10px;
}
.mobile-btn {
  &:focus {
    border: 1px solid #dcdfe6;
    color: #606266;
  }
}

.is-active__btn {
  border: 1px solid #409eff;
  background: #409eff;
  color: #fff;
  &:focus {
    color: #fff;
  }
}
</style>
