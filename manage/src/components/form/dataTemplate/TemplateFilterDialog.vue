<template>
  <el-dialog
    title="过滤条件"
    :visible.sync="dialogVisible"
    appendToBody
    :close-on-click-modal="false"
    :before-close="handleClose"
    top="6vh"
    custom-class="dialog__content"
  >
    <el-form v-model="filter" data-vv-scope="filterForm">
      <table class="form-table" cellspacing="0" cellpadding="0" border="0">
        <tbody>
          <tr>
            <th width="10%">脚本类型：</th>
            <td width="23%">
              <ht-select @change="changeFilterType" v-model="filter.filterType" :options="filterTypeList" :validate="{required: true}" />
            </td>
            <th width="10%">名称：</th>
            <td width="23%">
              <ht-input
                v-model="filter.name"
                :disabled="!isEditabled"
                :validate="{required: true}"
                :maxlength="50"
                :showWordLimit="true"
              ></ht-input>
            </td>
            <th width="10%">Key：</th>
            <td width="23%">
              <ht-input
                :disabled="!isEditabled"
                v-pinyin="filter.name"
                v-model="filter.key"
                :validate="{required: true, regex: {exp: '^[a-zA-Z][a-zA-Z0-9_]*$', message: '只能输入字母、数字、下划线，且以字母开头'}}"
                :maxlength="50"
                :showWordLimit="true"
              ></ht-input>
            </td>
          </tr>
          <tr v-if="filter.filterType == 1">
            <td colspan="6">
              <el-container>
                <el-main style="width:100%;">
                  <div style="position: relative; height: 360px;overflow: auto;width:100%;">
                    <div style="position: absolute; z-index: 2;">
                      <form data-vv-scope="form1" v-form>
                        <table class="table-list custom_condition_tab table" :style="tab.style" v-for="tab in tabList" :key="tab.indexStr">
                          <tbody>
                            <tr>
                              <td style="width:220px">
                                <el-select
                                  v-model="tab.property"
                                  v-validate="{required: true}"
                                  @change="setFieldOtherInfo(this, tab, 1)"
                                  style="width:200px;"
                                  size="mini"
                                >
                                  <el-option :value="m.pathStr" :label="m.desc" v-for="m in varTree" :key="m.pathStr"></el-option>
                                </el-select>
                              </td>
                              <td style="width:100px;">
                                <el-select v-model="tab.operator" v-if="tab.dataType == 'number'" style="width:90px;" size="mini">
                                  <el-option label="等于" value="1"></el-option>
                                  <el-option label="不等于" value="2"></el-option>
                                  <el-option label="大于" value="3"></el-option>
                                  <el-option label="大于等于" value="4"></el-option>
                                  <el-option label="小于" value="5"></el-option>
                                  <el-option label="小于等于" value="6"></el-option>
                                  <el-option label="等于变量" value="7"></el-option>
                                  <el-option label="不等于变量" value="8"></el-option>
                                </el-select>
                                <el-select v-model="tab.operator" v-if="tab.dataType != 'number'" style="width:90px;" size="mini">
                                  <el-option label="等于" value="1"></el-option>
                                  <el-option label="等于(忽略大小写)" value="3"></el-option>
                                  <el-option label="like" value="4"></el-option>
                                  <el-option label="like左" value="5"></el-option>
                                  <el-option label="like右" value="6"></el-option>
                                  <el-option label="等于变量" value="7"></el-option>
                                  <el-option label="不等于变量" value="8"></el-option>
                                </el-select>
                              </td>
                              <td
                                v-if="tab.compType != '2' && tab.dataType == 'date' && (tab.operator != 7 && tab.operator != 8)"
                                style="width:220px;"
                              >
                                <ht-date
                                  v-model="tab.value"
                                  style="width:215px;"
                                  :validate="{required: true}"
                                  :format="tab.format"
                                  :showDate="true"
                                  :day="-3"
                                />
                              </td>

                              <td
                                v-if="tab.compType != 2 && tab.dataType != 'date' && (tab.operator != 7 && tab.operator != 8)"
                                style="width:220px;"
                              >
                                <ht-input
                                  style="width:203px;"
                                  v-model="tab.value"
                                  :validate="{required: true}"
                                  :maxlength="50"
                                  :showWordLimit="true"
                                />
                              </td>
                              <td v-if="tab.operator == 7 || tab.operator == 8" style="width:220px;">
                                <el-select v-model="tab.value" v-if="tab.dataType != 'number' && tab.dataType != 'date' && tab.dataType !='clob'" size="mini">
                                  <el-option
                                    :value="cvar.alias"
                                    :label="cvar.title"
                                    v-for="cvar in comVarList"
                                    :key="cvar.alias"
                                  ></el-option>
                                </el-select>
                              </td>
                              <td style="width:60px;">
                                <el-button @click="removeCondition(tab.indexStr)" size="mini" icon="el-icon-delete"></el-button>
                              </td>
                            </tr>
                          </tbody>
                        </table>
                      </form>
                      <div
                        class="labelrag"
                        :style="branch.style + ';height: 24px'"
                        v-for="(branch, $index) in branchList"
                        :key="branch.indexStr"
                      >
                        <el-select v-model="branch.newjunction" class="selected_search" @change="changecondition($index)">
                          <el-option label="并且" value="and"></el-option>
                          <el-option label="或者" value="or"></el-option>
                          <el-option label="添加条件" value="3"></el-option>
                          <el-option label="添加联合条件" value="4" v-if="branch.condition != 'noAdd'"></el-option>
                          <el-option label="删除" value="5" v-if="branch.condition != 'noDel'"></el-option>
                        </el-select>
                      </div>
                    </div>
                    <div v-html="svgHtml" style="position: absolute; z-index: 1; width:100%; height: 100%;"></div>
                  </div>
                </el-main>
              </el-container>
            </td>
          </tr>
          <tr v-show="filter.filterType == 2 || filter.filterType == 3">
            <th width="10%">常用变量：</th>
            <td colspan="5">
              <template>
                <el-select v-model="selectVar" placeholder="请选择" @change="clickVar">
                  <el-option-group v-for="group in varList" :key="group.label" :label="group.label">
                    <el-option v-for="item in group.options" :key="item.value" :label="item.value" :value="item.key"></el-option>
                  </el-option-group>
                </el-select>
              </template>
            </td>
          </tr>
          <tr v-show="filter.filterType == 2 || filter.filterType == 3">
            <td colspan="6">
              <codemirror ref="mycode" :value="filter.filter" :options="cmOptions" class="code"></codemirror>
            </td>
          </tr>
          <tr v-if="filter.filterType == 4">
            <td colspan="6">
              <table class="form-table" cellspacing="0" cellpadding="0" border="0">
                <tbody>
                  <tr>
                    <th width="30%">权限字段</th>
                    <th width="20%">数据关系</th>
                    <th width="50%">权限类型</th>
                  </tr>
                  <tr>
                    <td>
                      <ht-select v-model="filter.loginUserField" :options="sqlOption.options" clearable />
                    </td>
                    <td>等于</td>
                    <td>
                      <el-checkbox v-model="filter.loginUser" true-label="1" false-label="0">当前登陆用户的ID</el-checkbox>
                    </td>
                  </tr>
                  <!--lyzcw:2022-05-09 添加对授权用户组的数据过滤 -->
                  <tr>
                    <td>
                      <ht-select v-model="filter.loginUsersField" :options="sqlOption.options" clearable />
                    </td>
                    <td>包含</td>
                    <td>
                      <el-checkbox v-model="filter.loginUsers" true-label="1" false-label="0">当前登陆用户的ID</el-checkbox>
                    </td>
                  </tr>
                  <tr>
                    <td>
                      <ht-select v-model="filter.loginUserOrgsField" :options="sqlOption.options" clearable />
                    </td>
                    <td>等于</td>
                    <td>
                      <el-checkbox v-model="filter.loginUserOrgs" true-label="1" false-label="0">当前登陆用户所属组织的ID</el-checkbox>
                    </td>
                  </tr>
                  <tr>
                    <td>
                      <ht-select v-model="filter.loginUserSubOrgsField" :options="sqlOption.options" clearable />
                    </td>
                    <td>属于</td>
                    <td>
                      <el-checkbox v-model="filter.loginUserSubOrgs" true-label="1" false-label="0"
                        >当前登陆用户所属组织及下属组织的ID</el-checkbox
                      >
                    </td>
                  </tr>
                  <tr>
                    <td>
                      <ht-select v-model="filter.customOrgsField" :options="sqlOption.options" />
                    </td>
                    <td>属于</td>
                    <td>
                      <el-tag
                        v-for="selectOrg in orgSelectedArray"
                        closable
                        :disable-transitions="false"
                        :key="selectOrg.code"
                        @close="handleTagClose(selectOrg)"
                        >{{ ' ' + selectOrg.name }}</el-tag
                      >
                      <el-button @click="orgSelector()" type="primary" size="small" icon="el-icon-search" plain>选择组织</el-button>
                    </td>
                  </tr>
                  <!--lyzcw:2022-05-09 添加对汇报线下级的数据过滤 -->
                  <tr>
                    <td>
                      <ht-select v-model="filter.customRelsField" :options="sqlOption.options" />
                    </td>
                    <td>属于</td>
                    <td><span>当前登陆用户所在汇报线的下级：</span><br/>
                      <el-tag
                        v-for="selectRel in relSelectedArray"
                        closable
                        :disable-transitions="false"
                        :key="selectRel.typeKey"
                        @close="handleTagClose(selectRel)"
                        >{{ ' ' + selectRel.name }}</el-tag
                      >
                      <el-button @click="relSelector()" type="primary" size="small" icon="el-icon-search" plain>选择汇报线</el-button>
                    </td>
                  </tr>
                </tbody>
              </table>
            </td>
          </tr>
        </tbody>
      </table>
      <!-- 组织选择对话框  -->
      <eip-org-dialog ref="eipOrgDialog" name="eipOrgDialog" :value="orgSelectedArray" @onConfirm="dialogOnConfirm" append-to-body />
      <!-- 汇报线选择对话框  -->
      <eip-rel-dialog ref="eipRelDialog" name="eipRelDialog" :value="relSelectedArray" @onConfirm="dialogOnConfirmRel" append-to-body />
    </el-form>

    <span slot="footer" class="dialog-footer">
      <el-button type="primary" @click="onConfirm">确 定</el-button>
      <el-button @click="dialogVisible = false">取 消</el-button>
    </span>
  </el-dialog>
</template>
<script>
import form from '@/api/form.js'
import {codemirror} from 'vue-codemirror'
import 'codemirror/theme/ambiance.css'
import req from '@/request.js'
require('codemirror/mode/javascript/javascript')
const eipOrgDialog = () => import('@/components/dialog/EipOrgDialog.vue')
const eipRelDialog = () => import('@/components/dialog/EipRelDialog.vue')

export default {
  name: 'template-filter-dialog',
  components: {
    codemirror,
    eipOrgDialog,
    eipRelDialog
  },
  props: {
    colPrefix: String,
    metafields: Array,
    filterFields: Array,
    conditionFields: String
  },
  data() {
    return {
      comVarList: [],
      filter: {filterType: 1, name: ''},
      isEditabled: true,
      editFilter: {},
      orgSelectedArray: [],
      relSelectedArray: [],
      sqlOption: [],
      filterTypeList: [{key: 1, value: '条件脚本'}, {key: 3, value: '追加SQL'}, {key: 4, value: '数据权限'}],
      dialogVisible: false,
      varList: [],
      selectVar: '',
      curCode: '',
      cmOptions: {
        value: '',
        mode: 'text/javascript',
        lineNumbers: true,
        line: true,
        lineWiseCopyCut: true,
        showCursorWhenSelecting: true
      },

      conditionObj: {},
      conditionName: '',
      pathList: [],
      data: {},
      branchList: [],
      tabList: [],
      Tree: [],
      svgHeight: '400px',
      defaultCondition: {
        property: '',
        operator: '1',
        dataType: '',
        value: '',
        compType: '1'
      },
      Mleft: 50, //初始左边距50
      Mtop: 20, //初始上边距40
      XIncase: 100, //x轴递增数值70
      YIncase: 50, //y轴递增数据50
      svgHtml: '',
      varTree: [],
      filedsObj: {},
      scriptStr: '',
      localDsType: ''
    }
  },
  computed: {
    codemirror() {
      return this.$refs.mycode.codemirror
    }
  },
  mounted() {
    this.getDataSource()
    if (this.$store.state.login.currentUser.userAttrs.tenantId != -1) {
      this.filterTypeList.splice(1, 1)
    }
  },
  methods: {
    initData() {
      this.varList = []
      this.filter = {filterType: 1, name: '', key: ''}
      this.sqlOption = {label: 'SQL字段', options: []}
      let varOption = {label: '常用变量', options: []}
      let confOption = {label: '条件字段', options: []}
      //获取变量
      form.getDataTemplateVarList().then(response => {
        this.comVarList = response
        if (response && response.length > 0) {
          response.forEach(obj => {
            if (obj.alias == 'curUserAccount') {
              obj.alias = "'[curUserAccount]'"
            } else if (obj.alias == 'curUserId') {
              obj.alias = "'[curUserId]'"
            }
            varOption.options.push({key: obj.alias, value: obj.title})
          })
        }
      })
      //获取字段
      if (this.metafields && this.metafields.length > 0) {
        //this.metafields = this.metafields.filter(item => !item.flowField);
        this.metafields.forEach(field => {
          if (field.type && field.type != 'null') {
            if (field.type == 'clob' && this.localDsType == 'oracle') {
              this.sqlOption.options.push({
                key: 'TO_CHAR(' + this.colPrefix + field.name + ')',
                value: field.desc
              })
            } else {
              this.sqlOption.options.push({
                key: this.colPrefix + field.name,
                value: field.desc
              })
            }
          }
        })
      }
      //条件字段
      if (this.conditionFields) {
        let conditions = JSON.parse(this.conditionFields)
        if (conditions.length > 0) {
          conditions.forEach(obj => {
            confOption.options.push({
              key: this.colPrefix + obj.na,
              value: obj.cm
            })
          })
        }
      }
      this.varList.push(this.sqlOption)
      this.varList.push(varOption)
      this.varList.push(confOption)
      if (this.editFilter && this.editFilter.key) {
        this.isEditabled = false
        let tempFilter = {}
        tempFilter.name = this.editFilter.name
        tempFilter.key = this.editFilter.key
        tempFilter.filter = this.editFilter.condition
        if (this.editFilter.type == 4 && tempFilter.filter) {
          let filterJson = JSON.parse(tempFilter.filter)
          for (let i = 0; i < filterJson.length; i++) {
            let obj = filterJson[i]
            if ('customOrgs' != obj.type && 'customRels' != obj.type ) {
              tempFilter[obj.type] = '1'
            } else if ('customOrgs' == obj.type) {
              this.orgSelectedArray = obj.orgs
            } else if ('customRels' == obj.type) {
              this.relSelectedArray = obj.rels
            }

            if (obj.field) {
              tempFilter[obj.type + 'Field'] = obj.field
            }
          }
          this.filter = tempFilter
          
        } else if (this.editFilter.type == 1) {
          this.filter = tempFilter
          let conditionJson = JSON.parse(this.filter.filter)
          this.conditionObj = conditionJson
          this.buildConditionTree(conditionJson)
          this.buildVarTree(this.metafields)
        } else if (this.editFilter.type == 2 || this.editFilter.type == 3) {
          this.$set(this.filter, 'key', this.editFilter.key)
          this.$set(this.filter, 'name', this.editFilter.name)
          this.$set(this.filter, 'filter', this.editFilter.condition)
        }
        this.$set(this.filter, 'filterType', this.editFilter.type)
        // this.filter.filterType = this.editFilter.type;
      } else {
        this.isEditabled = true
        if (this.filter.filterType == 2 || this.filter.filterType == 3) {
          this.codemirror.setValue(' ')
        } else if (this.filter.filterType == 1) {
          this.conditionObj = {junction: 'and', condition: []}
          this.buildConditionTree(this.conditionObj)
          this.buildVarTree(this.metafields)
        }
      }
    },
    showDialog(conf) {
      if (conf.editFilter) {
        this.editFilter = conf.editFilter
      }
      this.dialogVisible = true
      this.initData()
    },
    changeFilterType() {
      if ((this.filter.filterType == 2 || this.filter.filterType == 3) && this.filter.filterType != this.editFilter.type) {
        this.filter.filter = ' '
        this.codemirror.setValue(' ')
      }
    },
    clickVar() {
      this.codemirror.replaceSelection(' ' + this.selectVar + ' ')
    },
    saveFormValid() {
      if (!this.filter.name) {
        this.$message.error('名称不能为空！')
        return false
      }
      if (!this.filter.key) {
        this.$message.error('Key不能为空！')
        return false
      }
      //key不能重复
      if (this.isEditabled) {
        for (let i = 0; i < this.filterFields.length; i++) {
          if (this.filterFields[i].key == this.filter.key) {
            this.$message.error('Key已被使用，请重新填写！')
            this.filter.key = ''
            return false
          }
        }
      }
      // 处理过滤条件
      if (this.filter.filterType == 1) {
        if (!this.tabList || this.tabList.length < 1) {
          this.$message.error('请添加过滤条件！')
          return false
        }
        this.filter.filter = JSON.stringify(this.conditionObj)
      } else if (this.filter.filterType == 4) {
        this.filter.filter = this.getPermissionData()
      } else {
        this.filter.filter = this.codemirror.getValue()
      }
      return true
    },
    isNotZeroEmpty(val) {
      if (!val || val === '0') {
        return false
      }
      return true
    },
    getPermissionData() {
      let resultData = []
      if (
        !this.isNotZeroEmpty(this.filter.loginUser) &&
        !this.isNotZeroEmpty(this.filter.loginUsers) &&
        !this.isNotZeroEmpty(this.filter.loginUserOrgs) &&
        !this.isNotZeroEmpty(this.filter.loginUserSubOrgs) &&
        !this.isNotZeroEmpty(this.filter.customOrgsField) &&
        !this.isNotZeroEmpty(this.filter.customRelsField)
      ) {
        this.$message.error('请选择权限类型！')
        throw new Error('请选择权限类型.')
      }
      if (this.filter.loginUser && this.filter.loginUser !== '0') {
        if (!this.filter.loginUserField) {
          this.$message.error('请选择当前登陆用户对应字段！')
          throw new Error('请选择当前登陆用户对应字段.')
        }
        resultData.push({
          type: 'loginUser',
          name: '当前登录用户数据',
          field: this.filter.loginUserField
        })
      }
      // lyzcw:2022-05-09 添加对授权用户组的数据过滤
      if (this.filter.loginUsers && this.filter.loginUsers !== '0') {
        if (!this.filter.loginUsersField) {
          this.$message.error('请选择当前登陆用户对应字段！')
          throw new Error('请选择当前登陆用户对应字段.')
        }
        resultData.push({
          type: 'loginUsers',
          name: '当前登录用户数据',
          field: this.filter.loginUsersField
        })
      }

      if (this.filter.loginUserOrgs && this.filter.loginUserOrgs !== '0') {
        if (!this.filter.loginUserOrgsField) {
          this.$message.error('请选择当前登陆用户所属组织对应字段！')
          throw new Error('请选择当前登陆用户所属组织对应字段.')
        }
        resultData.push({
          type: 'loginUserOrgs',
          name: '当前登陆用户所属组织',
          field: this.filter.loginUserOrgsField
        })
      }

      if (this.filter.loginUserSubOrgs && this.filter.loginUserSubOrgs !== '0') {
        if (!this.filter.loginUserSubOrgsField) {
          this.$message.error('请选择当前登陆用户所属组织及下属组织对应字段！')
          throw new Error('请选择当前登陆用户所属组织及下属组织对应字段.')
        }
        resultData.push({
          type: 'loginUserSubOrgs',
          name: '当前登陆用户所属组织及下属组织',
          field: this.filter.loginUserSubOrgsField
        })
      }

      if (this.orgSelectedArray) {
        if (this.filter.customOrgsField) {
          //this.$message.error("请选择自定义选择组织对应字段！");
          //throw new Error("请选择自定义选择组织对应字段.");
          let customOrgs = {
            type: 'customOrgs',
            name: '自定义选择组织',
            orgs: [],
            field: this.filter.customOrgsField
          }
          for (let int = 0; int < this.orgSelectedArray.length; int++) {
            let selectOrg = this.orgSelectedArray[int]
            let orgObj = {}
            orgObj.id = selectOrg.id
            orgObj.name = selectOrg.name
            customOrgs.orgs.push(orgObj)
          }
          resultData.push(customOrgs)
        }
      }

      if (this.relSelectedArray) {
        if (this.filter.customRelsField) {
          //this.$message.error("请选择自定义选择组织对应字段！");
          //throw new Error("请选择自定义选择组织对应字段.");
          let customRels = {
            type: 'customRels',
            name: '自定义选择汇报线',
            rels: [],
            field: this.filter.customRelsField
          }
          for (let int = 0; int < this.relSelectedArray.length; int++) {
            let selectRel = this.relSelectedArray[int]
            // lyzcw:2022-05-13，因为汇报线上下级查询接口以typeKey为条件，所有id以typeKey存储
            // console.log("selectRel：", selectRel )
            let relObj = {}
            if( selectRel.typeKey ){
              relObj.id = selectRel.typeKey
            }else{
              relObj.id = selectRel.id
            }
            relObj.name = selectRel.name
            relObj.typeKey = selectRel.typeKey
            // console.log("relObj：", relObj )
            customRels.rels.push(relObj)
          }
          if(customRels.rels.length >0) resultData.push(customRels)
        }
      }
      return JSON.stringify(resultData)
    },
    orgSelector() {
      this.$refs.eipOrgDialog.showDialog({})
    },
    relSelector() {
      this.$refs.eipRelDialog.showDialog({})
    },
    handleTagClose(tag) {
      if (this.orgSelectedArray && this.orgSelectedArray.length > 0) {
        for (let i = 0; i < this.orgSelectedArray.length; i++) {
          if (this.orgSelectedArray[i].id == tag.id) {
            this.orgSelectedArray.splice(i, 1)
            return
          }
        }
      }
      if (this.relSelectedArray && this.relSelectedArray.length > 0) {
        for (let i = 0; i < this.relSelectedArray.length; i++) {
          if (this.relSelectedArray[i].id == tag.id) {
            this.relSelectedArray.splice(i, 1)
            return
          }
        }
      }
    },
    dialogOnConfirm(data) {
      if (data && data.length > 0 ) {
        this.orgSelectedArray = data
      } else {
        this.orgSelectedArray = []
      }
    },
    dialogOnConfirmRel(data) {
      // lyzcw:2022-05-11 添加汇报线数据过滤支持
      if (data && data.length > 0 ) {
        //console.log("dialogOnConfirmRel.data：", data);
        this.relSelectedArray = data
      } else {
        this.relSelectedArray = []
      }
    },
    onConfirm(selection) {
      if (this.saveFormValid()) {
        this.dialogVisible = false
        this.$emit('onConfirm', selection, this.filter)
      }
    },
    handleClose() {
      this.dialogVisible = false
    },
    //根据条件数组构建条件分支界面
    buildConditionTree(data) {
      let pathArr = []
      let tableArr = []
      let branchArr = []
      this.buildData(data, pathArr, tableArr, branchArr)
      this.pathList = pathArr
      this.branchList = branchArr
      this.tabList = tableArr
      //取路径最后一条数据，因为该条数据的高度距离顶部最大
      let lastPath = pathArr[pathArr.length - 1]
      let lastIndexArr = []
      if (lastPath) lastIndexArr = lastPath.split(',')
      //取最后一个坐标点。终点纵坐标为整个svg中最大的纵坐标
      let lastYIndex = lastIndexArr[lastIndexArr.length - 1]
      //设置svg的高度为最大纵坐标+100，从而实现svg页面高度自适应
      if (lastYIndex) {
        this.svgHeight = parseInt(lastYIndex) + 50 + 'px'
      }
      this.createSvgHtml(pathArr)
    },
    //构建svg图形页面
    createSvgHtml(pathArr) {
      this.svgHtml = ''
      var html =
        '<svg height="' +
        this.svgHeight +
        '" version="1.1" width="692" xmlns="http://www.w3.org/2000/svg" style="overflow: hidden; position: relative;">'
      for (var i = 0; i < pathArr.length; i++) {
        html +=
          '<path fill="none" stroke="#787878"' +
          'd="' +
          this.pathList[i] +
          '" style="-webkit-tap-highlight-color: rgba(0, 0, 0, 0);"></path>'
      }
      html += '</svg>'
      this.svgHtml = html
    },
    changecondition(index) {
      var oldVal = this.branchList[index].oldjunction
      var newVal = this.branchList[index].newjunction
      if (newVal == '3' || newVal == '4' || newVal == '5') {
        this.branchList[index].newjunction = this.branchList[index].oldjunction
        var indexStr = this.branchList[index].indexStr
        if (newVal == '3') {
          this.addCondition(indexStr)
        } else if (newVal == '4') {
          this.addUnionCondition(indexStr)
        } else {
          this.$confirm('确定要删除此联合条件及其下属的所有子条件吗？', '提示', {
            cancelButtonText: '取消',
            confirmButtonText: '确定',
            type: 'warning',
            closeOnClickModal: false
          }).then(() => {
            this.removeCondition(indexStr)
          })
        }
      } else {
        this.branchList[index].oldjunction = this.branchList[index].newjunction
        var indexStr = this.branchList[index].indexStr
        var indexArr = indexStr.split(',')
        if (indexStr == 'root') {
          this.conditionObj.junction = newVal
        } else if (indexArr.length == 1) {
          this.conditionObj.condition[indexStr].junction = newVal
        } else if (indexArr.length == 2) {
          this.conditionObj.condition[indexArr[0]].condition[indexArr[1]].junction = newVal
        }
      }
    },
    //添加一个联合
    addCondition(indexStr) {
      var data = this.conditionObj.condition
      if (indexStr == 'root') {
        data.push(JSON.parse(JSON.stringify(this.defaultCondition)))
      } else {
        var indexArr = []
        if (indexStr) indexArr = indexStr.split(',')
        for (var i = 0; i < data.length; i++) {
          if (indexArr.length > 0 && i == indexArr[0]) {
            if (indexArr.length > 1) {
              for (var j = 0; j < data[i].condition.length; j++) {
                if (j == indexArr[1]) {
                  data[i].condition[j].condition.push(JSON.parse(JSON.stringify(this.defaultCondition)))
                  break
                }
              }
            } else {
              data[i].condition.push(JSON.parse(JSON.stringify(this.defaultCondition)))
            }
            break
          }
        }
      }
      this.conditionObj.condition = data
      this.buildConditionTree(this.conditionObj)
    },
    removeCondition(indexStr) {
      var indexArr = []
      if (indexStr) indexArr = indexStr.split(',')
      if (indexArr.length > 0) {
        var data = this.conditionObj.condition
        for (var i = 0; i < data.length; i++) {
          if (i == indexArr[0]) {
            if (indexArr.length > 1) {
              for (var j = 0; j < data[i].condition.length; j++) {
                if (j == indexArr[1]) {
                  if (indexArr.length > 2) {
                    for (var z = 0; z < data[i].condition[j].condition.length; z++) {
                      if (z == indexArr[2]) {
                        data[i].condition[j].condition.splice(z, 1)
                        break
                      }
                    }
                  } else {
                    data[i].condition.splice(j, 1)
                  }
                  break
                }
              }
            } else {
              data.splice(i, 1)
            }
            break
          }
        }
        this.conditionObj.condition = data
        this.buildConditionTree(this.conditionObj)
      }
    },
    //添加一个联合条件条件
    addUnionCondition(indexStr) {
      var data = this.conditionObj.condition
      if (indexStr == 'root') {
        data.push({junction: 'or', condition: []})
      } else {
        var indexArr = []
        if (indexStr) indexArr = indexStr.split(',')
        for (var i = 0; i < data.length; i++) {
          if (indexArr.length > 0 && i == indexArr[0]) {
            if (indexArr.length > 1) {
              for (var j = 0; j < data[i].condition.length; j++) {
                if (j == indexArr[1]) {
                  data[i].condition[j].condition.push({
                    junction: 'or',
                    condition: []
                  })
                  break
                }
              }
            } else {
              data[i].condition.push({junction: 'or', condition: []})
            }
            break
          }
        }
      }
      this.conditionObj.condition = data
      this.buildConditionTree(this.conditionObj)
    },
    buildData(conditionData, pathArr, tableArr, branchArr) {
      let curYIndex = 0
      let data = conditionData.condition
      //算三级节点总共分支个数
      let yIncaseNum = this.getyIncaseNum(conditionData.condition) > 1 ? this.getyIncaseNum(conditionData.condition) : 1
      //第一个节点 this.Mtop 最后一个节点Mtop+this.YIncase*（yIncaseNum-1）
      let startY1 = (this.Mtop * 2 + this.YIncase * (yIncaseNum - 1)) / 2

      branchArr.push({
        newjunction: conditionData.junction,
        oldjunction: conditionData.junction,
        style: 'left:' + (this.Mleft - 35) + 'px; top:' + (startY1 - 15) + 'px',
        indexStr: 'root',
        condition: 'noDel'
      })
      for (var i = 0; i < data.length; i++) {
        if (data[i].condition) {
          var curchildNum = this.getyIncaseNum(data[i].condition)
          //如果该节点，没有分支条件，则保留节点
          var isEmpty0 = false
          if (curchildNum < 1) {
            curchildNum = 1
            isEmpty0 = true
          }
          //计算一级节点和该节点的连线
          var startY2 = (this.Mtop * 2 + this.YIncase * (2 * curYIndex + curchildNum - 1)) / 2
          var path =
            'M' +
            this.Mleft +
            ',' +
            startY1 +
            'C' +
            this.Mleft +
            ',' +
            startY2 +
            ',' +
            this.Mleft +
            ',' +
            startY2 +
            ',' +
            (this.Mleft + this.XIncase) +
            ',' +
            startY2
          pathArr.push(path)
          branchArr.push({
            newjunction: data[i].junction,
            oldjunction: data[i].junction,
            style: 'left:' + (this.Mleft + this.XIncase - 35) + 'px; top:' + (startY2 - 15) + 'px',
            indexStr: '' + i
          })
          if (isEmpty0) curYIndex++

          for (var j = 0; j < data[i].condition.length; j++) {
            //如果第三级节点有分支，则计算分支
            if (data[i].condition[j].condition) {
              //计算改节点分支个数
              let curchildNum2 = this.getyIncaseNum(data[i].condition[j].condition)
              //如果该节点，没有分支条件，则保留节点,默认其占一行
              let isEmpty = false
              if (curchildNum2 < 1) {
                curchildNum2 = 1
                isEmpty = true
              }
              // 改分支第一个节点纵坐标= this.Mtop+this.YIncase*curYIndex  上一个节点纵坐标加上递增值
              // 改分支最后节点纵坐标=改分支第一个节点纵坐标 +计算改节点分支个数*y递增值 this.Mtop+this.YIncase*curYIndex+this.YIncase*(curchildNum2-1)
              // 计算改节点的纵坐标。（改分支第一个节点纵坐标+该分支的最后一个纵坐标）/2
              // 该节点起始点纵坐标=  this.Mtop+this.YIncase*curYIndex+ this.Mtop+this.YIncase*curYIndex+this.YIncase*(curchildNum2-1)
              let startY3 = (this.Mtop * 2 + this.YIncase * (2 * curYIndex + curchildNum2 - 1)) / 2
              //改分支指引线的终点的纵坐标等于startY2
              let path =
                'M' +
                (this.Mleft + this.XIncase) +
                ',' +
                startY2 +
                'C' +
                (this.Mleft + this.XIncase) +
                ',' +
                startY3 +
                ',' +
                (this.Mleft + this.XIncase) +
                ',' +
                startY3 +
                ',' +
                (this.Mleft + this.XIncase * 2) +
                ',' +
                startY3
              pathArr.push(path)
              branchArr.push({
                newjunction: data[i].condition[j].junction,
                oldjunction: data[i].condition[j].junction,
                style: 'left:' + (this.Mleft + this.XIncase * 2 - 35) + 'px; top:' + (startY3 - 15) + 'px',
                indexStr: i + ',' + j,
                condition: 'noAdd'
              })
              if (isEmpty) {
                curYIndex++
              }
              for (let z = 0; z < data[i].condition[j].condition.length; z++) {
                let obj = data[i].condition[j].condition[z]
                obj.style = 'left:' + (this.Mleft + this.XIncase * 3) + 'px; top:' + (this.Mtop + this.YIncase * curYIndex - 19) + 'px'
                obj.indexStr = i + ',' + j + ',' + z
                tableArr.push(obj)
                //改分支下所有节点的起始纵坐标为startY3，终点纵坐标根据该节点位置决定
                let path =
                  'M' +
                  (this.Mleft + this.XIncase * 2) +
                  ',' +
                  startY3 +
                  'C' +
                  (this.Mleft + this.XIncase * 2) +
                  ',' +
                  (this.Mtop + this.YIncase * curYIndex) +
                  ',' +
                  (this.Mleft + this.XIncase * 2) +
                  ',' +
                  (this.Mtop + this.YIncase * curYIndex) +
                  ',' +
                  (this.Mleft + this.XIncase * 3) +
                  ',' +
                  (this.Mtop + this.YIncase * curYIndex)
                pathArr.push(path)
                curYIndex++
              }
            } else {
              //第二级节点没有分支
              let obj = data[i].condition[j]
              obj.style = 'left:' + (this.Mleft + this.XIncase * 2) + 'px; top:' + (this.Mtop + this.YIncase * curYIndex - 19) + 'px'
              obj.indexStr = i + ',' + j
              tableArr.push(obj)
              //计算改分支的路径。因为是第二节点。startY2
              let path =
                'M' +
                (this.Mleft + this.XIncase) +
                ',' +
                startY2 +
                'C' +
                (this.Mleft + this.XIncase) +
                ',' +
                (this.Mtop + this.YIncase * curYIndex) +
                ',' +
                (this.Mleft + this.XIncase) +
                ',' +
                (this.Mtop + this.YIncase * curYIndex) +
                ',' +
                (this.Mleft + this.XIncase * 2) +
                ',' +
                (this.Mtop + this.YIncase * curYIndex)
              pathArr.push(path)
              curYIndex++
            }
          }
        } else {
          let obj = data[i]
          obj.style = 'left:' + (this.Mleft + this.XIncase) + 'px; top:' + (this.Mtop + this.YIncase * curYIndex - 19) + 'px'
          obj.indexStr = '' + i
          tableArr.push(obj)
          let path =
            'M' +
            this.Mleft +
            ',' +
            startY1 +
            'C' +
            this.Mleft +
            ',' +
            (this.Mtop + this.YIncase * curYIndex) +
            ',' +
            this.Mleft +
            ',' +
            (this.Mtop + this.YIncase * curYIndex) +
            ',' +
            (this.Mleft + this.XIncase) +
            ',' +
            (this.Mtop + this.YIncase * curYIndex)
          pathArr.push(path)
          curYIndex++
        }
      }
    },
    //获取条件总数
    getyIncaseNum(data) {
      var sum = 0
      for (var i = 0; i < data.length; i++) {
        if (data[i].condition && data[i].condition.length > 0) {
          for (var j = 0; j < data[i].condition.length; j++) {
            if (data[i].condition[j].condition && data[i].condition[j].condition.length > 0) {
              for (var z = 0; z < data[i].condition[j].condition.length; z++) {
                sum++
              }
            } else {
              sum++
            }
          }
        } else {
          sum++
        }
      }
      return sum
    },
    buildVarTree(treeData) {
      var treeArr = []
      this.varTree = []
      this.filedsObj = {}
      if (treeData.length > 0) {
        treeData.forEach(field => {
          if (field.type && field.type != 'null') {
            let obj = {
              pathStr: this.colPrefix + field.name,
              desc: field.desc,
              dataType: field.type
            }
            treeArr.push(obj)
            this.filedsObj[obj.pathStr] = obj
          }
        })
        this.varTree = treeArr
      }
    },
    setFieldOtherInfo(ele, tab, type) {
      let selectFiled = this.filedsObj[tab.property]
      if (type == 1) {
        tab.dataType = selectFiled.dataType
        tab.format = selectFiled.format
        tab.chooseDesc = selectFiled.desc
        tab.value = ''
      } else {
        tab.changeDesc = selectFiled.desc
      }
    },
    getDataSource() {
      req.get('${portal}/sys/sysDataSource/v1/getDataSources').then(resp => {
        if (resp.data && resp.data.length > 0) {
          resp.data.forEach(item => {
            if (item.alias == 'LOCAL') {
              this.localDsType = item.dbType
            }
          })
        }
      })
    }
  }
}
</script>
<style lang="scss" scoped>
div >>> .el-dialog__body {
  padding: 10px;
}

.table > thead > tr > th,
.table > thead > th,
.table > tbody > tr > th,
.table > tfoot > tr > th,
.table > thead > tr > td,
.table > tbody > tr > td,
.table > tfoot > tr > td {
  border-top: 1px solid #e7eaec;
  border-left: 1px solid #e7eaec;
  line-height: 1.42857;
  vertical-align: middle;
  padding: 4px;
}

.table > tbody > tr > td {
  text-align: center;
}
.table {
  border-bottom: 1px solid #e7eaec;
  border-right: 1px solid #e7eaec;
  border-spacing: 0;
}
.table >>> .el-button {
  padding: 6px 8px;
}
div >>> .el-tabs__content {
  height: 450px;
  overflow: auto;
}
.labelrag {
  padding: 0.2em 0.2em 0.3em;
  font-size: 75%;
  font-weight: 700;
  line-height: 1;
  background-color: #fff;
  text-align: center;
  white-space: nowrap;
  vertical-align: baseline;
  border-radius: 12px;
  width: 70px;
  line-height: 20px;
  border: solid 1px;
  position: absolute;
  z-index: 3;
}
div >>> .labelrag > .selected_search {
  width: 60px;
  border: none;
  outline: none;
  height: 22px;
}
div >>> .labelrag > .el-select > .el-input > .el-input__inner {
  padding: 0px;
  border: none;
  height: 26px;
}
.custom_condition_tab {
  width: 700px;
  position: absolute;
}
.inputs >>> .el-form-item__error {
  display: none;
}

div >>> [aria-invalid='true'] .el-input .el-input__inner {
  border-color: #f56c6c;
}
.el-tag + .el-tag {
  margin-left: 5px;
  margin-right: 5px;
}
/deep/ .CodeMirror-sizer {
  min-width: unset !important;
  width: 1000px !important;
}
/deep/.el-dialog__wrapper {
  overflow: unset !important;
  &::-webkit-scrollbar {
    width: 0;
    background-color: transparent;
  }
}
/deep/ .dialog__content {
  width: 80%;
  height: 90%;
  min-height: 400px;
  .el-dialog__body {
    padding-top: 10px;
    padding-bottom: 10px;
    height: calc(100% - 140px);
    overflow-y: auto;
  }
}
@media (max-width: 1280px) {
  /deep/ .el-dialog {
    width: 90%;
    .CodeMirror-sizer {
      width: 830px !important;
    }
  }
}
@media (max-height: 960px) {
  /deep/ .el-dialog__body {
    .el-container {
      height: 100%;
    }
  }
}
</style>
