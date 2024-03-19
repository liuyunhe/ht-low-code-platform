<template>
  <div>
    <el-dialog
      :title="title"
      :visible.sync="dialogVisible"
      v-if="dialogVisible"
      width="80%"
      appendToBody
      :close-on-click-modal="false"
      top="8vh"
    >
      <el-container>
        <el-tabs v-model="userConditionTab" type="card" style="width: 100%">
          <el-tab-pane label="人员设置" name="first">
            <form v-form>
              <el-button icon="el-icon-plus" @click="addCalc">添加</el-button>
              <table
                class="table table-bordered"
                style="border-spacing: 0; width: 100%"
              >
                <thead>
                  <tr>
                    <th width="200">用户类型</th>
                    <th>用户来自</th>
                    <th width="120">抽取用户</th>
                    <th width="100">运算类型</th>
                    <th width="120">操作</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="(calc, $index) in userRule.calcs" :key="$index">
                    <td>
                      <el-select
                        size="mini"
                        v-model="calc.pluginType"
                        placeholder="请选择"
                        @change="calcTypeChange(calc)"
                      >
                        <el-option
                          v-for="item in nodeUserPluginList"
                          :key="item.type"
                          :label="item.title"
                          :value="item.type"
                        >
                        </el-option>
                      </el-select>
                    </td>
                    <td>
                      <eipOrgSelector
                        v-if="calc.pluginType == 'org'"
                        :single="true"
                        :appendToBody="true"
                        v-model="calc.orgName"
                        :config="{
                          code: 'userRule.calcs[' + $index + '].orgCode',
                        }"
                      />
                      <!-- <eipPostSelector v-if="calc.pluginType=='position'" :single="true" :appendToBody="true" v-model="calc.posName" :config="{code:'userRule.calcs['+$index+'].posCode'}"/> -->
                      <el-button
                        v-if="calc.pluginType == 'position'"
                        @click="selector($index)"
                        >选择</el-button
                      >
                      <eipJobSelector
                        v-if="calc.pluginType == 'job'"
                        :single="true"
                        :appendToBody="true"
                        v-model="calc.jobName"
                        :config="{
                          code: 'userRule.calcs[' + $index + '].jobCode',
                        }"
                      />
                      <eip-role-selector
                        v-if="calc.pluginType == 'role'"
                        v-model="calc.roleName"
                        :single="true"
                        :config="{
                          code: 'userRule.calcs[' + $index + '].roleCode',
                          name: 'userRule.calcs[' + $index + '].roleName',
                        }"
                        append-to-body
                      />
                      <el-button
                        v-show="
                          calc.pluginType == 'hrScript' ||
                          calc.pluginType == 'cusers' ||
                          calc.pluginType == 'customQuery' ||
                          calc.pluginType == 'matrix'
                        "
                        @click="selector($index)"
                        >选择</el-button
                      >
                      <span
                        style="font-size: 13px"
                        v-show="
                          calc.pluginType == 'hrScript' ||
                          calc.pluginType == 'cusers' ||
                          calc.pluginType == 'customQuery' ||
                          calc.pluginType == 'matrix' ||
                          calc.pluginType == 'position'
                        "
                        >{{ calc.description }}</span
                      >

                      <el-select
                        size="mini"
                        v-model="calc.nodeId"
                        placeholder="请选择"
                        v-if="calc.pluginType == 'sameNode'"
                        @change="changeSameNode(calc)"
                      >
                        <el-option
                          v-for="item in nodeList"
                          :key="item.nodeId"
                          :label="item.name"
                          :value="item.nodeId"
                        >
                        </el-option>
                      </el-select>
                      <el-switch
                        active-text="主负责人"
                        inactive-text="所有负责人"
                        v-model="calc.mainLeader"
                        v-show="calc.pluginType == 'depHead'"
                        active-color="#13ce66"
                        inactive-color="#dcdfe6"
                      >
                      </el-switch>
                      <el-tooltip
                        class="item"
                        effect="dark"
                        placement="top-start"
                        v-show="calc.pluginType == 'depHead'"
                      >
                        <div slot="content">
                          获取发起人默认维度下的主部门，如无主部门则获取其部门列表的第一个部门，如要指定维度请使用人员脚本。<br />一个组织只有一个主负责人，而负责人有多个
                        </div>
                        <i
                          v-show="calc.pluginType == 'depHead'"
                          class="el-icon-question"
                        ></i>
                      </el-tooltip>
                    </td>
                    <td>
                      <el-select
                        v-if="userRule.nodeType == 'userTask'"
                        v-model="calc.extract"
                        size="mini"
                      >
                        <el-option label="不抽取" value="no"> </el-option>
                        <el-option label="抽取" value="extract"> </el-option>
                      </el-select>
                      <el-select
                        v-if="userRule.nodeType == 'signTask'"
                        v-model="calc.extract"
                        size="mini"
                      >
                        <el-option label="不抽取" value="no"> </el-option>
                        <el-option label="抽取" value="extract"> </el-option>
                        <el-option label="延迟抽取" value="secondExtract">
                        </el-option>
                        <el-option label="用户组合" value="usergroup">
                        </el-option>
                      </el-select>
                    </td>
                    <td>
                      <el-select
                        v-if="$index != 0"
                        v-model="calc.logicCal"
                        size="mini"
                      >
                        <el-option label="或" value="or"> </el-option>
                        <el-option label="与" value="and"> </el-option>
                        <el-option label="排除" value="exclude"> </el-option>
                      </el-select>
                    </td>
                    <td>
                      <el-button
                        icon="el-icon-arrow-up"
                        @click="ArrayTool(userRule.calcs, $index, 'up')"
                      ></el-button>
                      <el-button
                        icon="el-icon-arrow-down"
                        @click="ArrayTool(userRule.calcs, $index)"
                      ></el-button>
                      <el-button
                        icon="el-icon-delete"
                        @click="userRule.calcs.remove(userRule.calcs[$index])"
                      ></el-button>
                    </td>
                  </tr>
                </tbody>
              </table>
              <FlowHrScriptSelector
                ref="flowHrScriptSelector"
                @scriptSelectorConfirm="scriptSelectorConfirm"
                append-to-body
              />
              <FlowCustomScriptSelector
                ref="flowCustomScriptSelector"
                @customScriptSelectorConfirm="customScriptSelectorConfirm"
                append-to-body
              />
              <FlowNodeUserRuleSelector
                ref="flowNodeUserRuleSelector"
                @customRuleSelectorConfirm="customRuleSelectorConfirm"
                append-to-body
              />
              <FlowCustomQuerySelector
                ref="flowCustomQuerySelector"
                @customQuerySelectorConfirm="customQuerySelectorConfirm"
                append-to-body
              />
              <FlowMatrixSelector
                ref="flowMatrixSelector"
                @confirm="matrixSelectorConfirm"
                append-to-body
              />
            </form>
          </el-tab-pane>
          <el-tab-pane label="人员规则设置" name="second">
            <div style="position: absolute; z-index: 2">
              <table
                class="table-list custom_condition_tab table"
                :style="tab.style"
                v-for="tab in tabList"
                :key="tab.indexStr"
              >
                <tbody>
                  <tr>
                    <td style="width: 12%; text-align: center">
                      <el-select
                        v-model="tab.ruleType"
                        style="width: 80px"
                        :disabled="isNotEmpty(tab.conDesc)"
                        size="mini"
                      >
                        <el-option label="规则" value="1"> </el-option>
                        <el-option label="脚本" value="2"> </el-option>
                      </el-select>
                    </td>
                    <td>
                      <span> {{ tab.conDesc }} </span>
                      <div style="display: inline-block; float: right">
                        <el-button
                          v-if="tab.conDesc"
                          icon="el-icon-edit"
                          @click="editCondition(tab)"
                        ></el-button>
                        <el-button
                          v-if="!tab.conDesc"
                          icon="el-icon-plus"
                          @click="editCondition(tab)"
                        ></el-button>
                        <el-button
                          icon="el-icon-delete"
                          @click="removeCondition(tab.indexStr)"
                        ></el-button>
                      </div>
                    </td>
                  </tr>
                </tbody>
              </table>

              <div
                class="labelrag"
                :style="branch.style"
                v-for="(branch, $index) in branchList"
                :key="branch.indexStr"
              >
                <el-select
                  v-model="branch.newjunction"
                  style="height: 26px"
                  class="selected_search"
                  @change="changecondition($index)"
                >
                  <el-option label="并且" value="and"> </el-option>
                  <el-option label="或者" value="or"> </el-option>
                  <el-option label="添加条件" value="3"> </el-option>
                  <el-option
                    label="添加联合条件"
                    value="4"
                    v-if="branch.condition != 'noAdd'"
                  >
                  </el-option>
                  <el-option
                    label="删除"
                    value="5"
                    v-if="branch.condition != 'noDel'"
                  >
                  </el-option>
                </el-select>
              </div>
            </div>
            <div
              v-html="svgHtml"
              style="position: absolute; z-index: 1; width: 500px; height: 100%"
            ></div>
          </el-tab-pane>
        </el-tabs>
      </el-container>
      <span slot="footer" class="dialog-footer">
        <el-button type="primary" @click="handleClose" size="medium"
          >确 定</el-button
        >
        <el-button @click="dialogVisible = false" size="medium"
          >取 消</el-button
        >
      </span>
    </el-dialog>
    <FlowNodeCusersSelector
      ref="flowNodeCusersSelector"
      @cuserSelectorConfirm="cuserSelectorConfirm"
      append-to-body
    />
    <FlowNodePositionSelector
      ref="flowNodePositionSelector"
      @positionSelectorConfirm="positionSelectorConfirm"
      append-to-body
    />
  </div>
</template>

<script>
import flow from '@/api/flow.js'
import req from '@/request.js'
import {mapState, mapActions} from 'vuex'
import FlowNodeCusersSelector from '@/components/flow/FlowNodeCusersSelector.vue'
import utils from '@/hotent-ui-util.js'

const eipRoleSelector = () =>
  import('@/components/selector/EipRoleSelector.vue')
const eipOrgSelector = () => import('@/components/selector/EipOrgSelector.vue')
const eipPostSelector = () =>
  import('@/components/selector/EipPostSelector.vue')
const eipJobSelector = () => import('@/components/selector/EipJobSelector.vue')

const FlowHrScriptSelector = () =>
  import('@/components/flow/FlowHrScriptSelector.vue')
const FlowCustomScriptSelector = () =>
  import('@/components/flow/FlowCustomScriptSelector.vue')
const FlowNodeUserRuleSelector = () =>
  import('@/components/flow/FlowNodeUserRuleSelector.vue')
const FlowCustomQuerySelector = () =>
  import('@/components/flow/FlowCustomQuerySelector.vue')
const FlowMatrixSelector = () =>
  import('@/components/flow/FlowMatrixSelector.vue')
const FlowNodePositionSelector = () =>
  import('@/components/flow/FlowNodePositionSelector.vue')

export default {
  components: {
    FlowNodeCusersSelector,
    eipRoleSelector,
    eipOrgSelector,
    eipJobSelector,
    eipPostSelector,
    FlowHrScriptSelector,
    FlowCustomScriptSelector,
    FlowNodeUserRuleSelector,
    FlowCustomQuerySelector,
    FlowMatrixSelector,
    FlowNodePositionSelector,
  },
  data() {
    return {
      userConditionTab: 'first',
      dialogVisible: false,
      title: '节点人员设置',
      userRule: {calcs: [], nodeType: ''},
      nodeList: [],
      conditionList: [],
      curNode: {},
      nodeUserPluginList: [],
      conditionObj: {},
      conditionName: '',
      pathList: [],
      data: {},
      branchList: [],
      tabList: [],
      Tree: [],
      svgHeight: '400px',
      defaultCondition: {ruleType: '2', conDesc: ''},
      Mleft: 50, //初始左边距50
      Mtop: 20, //初始上边距40
      XIncase: 100, //x轴递增数值70
      YIncase: 50, //y轴递增数据50
      svgHtml: '',
      curEditTab: {},
    }
  },
  computed: mapState({
    defConfigData: (state) => state.flow.defConfigData,
  }),
  methods: {
    isNotEmpty(val) {
      if (!val || val.length == 0) {
        return false
      }
      return true
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
    ArrayTool(ary, idx, direct) {
      direct = direct || 'down'
      let part = ary[idx]
      if (
        !part ||
        (part.constructor !== Object && part.constructor !== Array)
      ) {
        return ary
      }
      if (part.constructor === Object) {
        part = [part]
      }
      if (direct == 'up') {
        part.forEach((m) => {
          let index = ary.indexOf(m, 1)
          if (index > 0) {
            let t = ary[index - 1]
            ary.splice(index - 1, 1, ary[index])
            ary.splice(index, 1, t)
          }
        })
      } else if (direct == 'down') {
        for (var i = part.length - 1, m; (m = part[i--]); ) {
          let index = ary.indexOf(m, 0)
          if (index > -1 && index < ary.length - 1) {
            let t = ary[index + 1]
            ary.splice(index + 1, 1, ary[index])
            ary.splice(index, 1, t)
          }
        }
      }
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
          this.$confirm(
            '确定要删除此联合条件及其下属的所有子条件吗？',
            '提示',
            {
              cancelButtonText: '取消',
              confirmButtonText: '确定',
              type: 'warning',
              closeOnClickModal: false,
            }
          ).then(() => {
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
          this.conditionObj.condition[indexArr[0]].condition[
            indexArr[1]
          ].junction = newVal
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
                  data[i].condition[j].condition.push(
                    JSON.parse(JSON.stringify(this.defaultCondition))
                  )
                  break
                }
              }
            } else {
              data[i].condition.push(
                JSON.parse(JSON.stringify(this.defaultCondition))
              )
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
                    for (
                      var z = 0;
                      z < data[i].condition[j].condition.length;
                      z++
                    ) {
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
                    condition: [],
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
      let yIncaseNum =
        this.getyIncaseNum(conditionData.condition) > 1
          ? this.getyIncaseNum(conditionData.condition)
          : 1
      //第一个节点 this.Mtop 最后一个节点Mtop+this.YIncase*（yIncaseNum-1）
      let startY1 = (this.Mtop * 2 + this.YIncase * (yIncaseNum - 1)) / 2

      branchArr.push({
        newjunction: conditionData.junction,
        oldjunction: conditionData.junction,
        style: 'left:' + (this.Mleft - 35) + 'px; top:' + (startY1 - 15) + 'px',
        indexStr: 'root',
        condition: 'noDel',
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
          var startY2 =
            (this.Mtop * 2 + this.YIncase * (2 * curYIndex + curchildNum - 1)) /
            2
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
            style:
              'left:' +
              (this.Mleft + this.XIncase - 35) +
              'px; top:' +
              (startY2 - 15) +
              'px',
            indexStr: '' + i,
          })
          if (isEmpty0) curYIndex++

          for (var j = 0; j < data[i].condition.length; j++) {
            //如果第三级节点有分支，则计算分支
            if (data[i].condition[j].condition) {
              //计算改节点分支个数
              let curchildNum2 = this.getyIncaseNum(
                data[i].condition[j].condition
              )
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
              let startY3 =
                (this.Mtop * 2 +
                  this.YIncase * (2 * curYIndex + curchildNum2 - 1)) /
                2
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
                style:
                  'left:' +
                  (this.Mleft + this.XIncase * 2 - 35) +
                  'px; top:' +
                  (startY3 - 15) +
                  'px',
                indexStr: i + ',' + j,
                condition: 'noAdd',
              })
              if (isEmpty) {
                curYIndex++
              }
              for (let z = 0; z < data[i].condition[j].condition.length; z++) {
                let obj = data[i].condition[j].condition[z]
                obj.style =
                  'left:' +
                  (this.Mleft + this.XIncase * 3) +
                  'px; top:' +
                  (this.Mtop + this.YIncase * curYIndex - 19) +
                  'px'
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
              obj.style =
                'left:' +
                (this.Mleft + this.XIncase * 2) +
                'px; top:' +
                (this.Mtop + this.YIncase * curYIndex - 19) +
                'px'
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
          obj.style =
            'left:' +
            (this.Mleft + this.XIncase) +
            'px; top:' +
            (this.Mtop + this.YIncase * curYIndex - 19) +
            'px'
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
            if (
              data[i].condition[j].condition &&
              data[i].condition[j].condition.length > 0
            ) {
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
    calcTypeChange: function (calc) {
      calc.description = ''
      if (calc.pluginType == 'approver') {
        //流程实例审批人，在此处设置description
        calc.description = '流程实例审批人'
      } else if (calc.pluginType == 'depHead') {
        //部门负责人审批人，在此处设置description
        calc.description = '部门负责人'
      } else if (calc.pluginType == 'position') {
        calc.source = 'spec'
      }
    },
    addCalc: function () {
      this.userRule.calcs.push({
        pluginType: 'cusers',
        extract: 'no',
        logicCal: 'or',
        source: 'start',
        vars: '',
        description: '发起人',
        nodeType: this.userRule.nodeType,
        parentParam: {},
        curEditIndex: '',
      })
    },
    selector: function (index) {
      this.curEditIndex = index
      let calc = this.userRule.calcs[index]
      let type = calc.pluginType
      if (
        type != 'cusers' &&
        type != 'hrScript' &&
        type != 'customQuery' &&
        type != 'matrix' &&
        type != 'position'
      ) {
        this.$message.error('没有其他类型的选择器，暂时只能选用户')
        return
      }
      eval('this.' + calc.pluginType + 'Selector(calc);')
    },
    cusersSelector: function (calc) {
      let param = {...this.parentParam, calc: calc}
      this.$refs.flowNodeCusersSelector.showDialog(param)
    },
    positionSelector: function (calc) {
      let param = {...this.parentParam, calc: calc}
      this.$refs.flowNodePositionSelector.showDialog(param)
    },
    hrScriptSelector: function (calc) {
      let param = {...this.parentParam, calc: calc}
      this.$refs.flowHrScriptSelector.showDilaog(param)
    },
    matrixSelector: function (calc) {
      let param = {...this.parentParam, calc: calc}
      this.$refs.flowMatrixSelector.showDilaog(param)
    },
    customQuerySelector: function (calc) {
      let param = {...this.parentParam, calc: calc}
      this.$refs.flowCustomQuerySelector.showDilaog(param)
    },
    showDialog: function (param) {
      this.parentParam = param
      this.nodeList = []
      if (param.nodeId) {
        for (const node of this.defConfigData.nodeSetData.nodes) {
          if (node.nodeId == param.nodeId) {
            this.curNode = node
          } else {
            if (node.type == 'signTask' || node.type == 'userTask') {
              this.nodeList.push(node)
            }
          }
        }
        if (this.curNode.name) {
          this.title = '【' + this.curNode.name + '】节点人员设置'
        }
      }
      if (param.userRule) {
        param.userRule.nodeType = this.curNode.type
        this.userRule = param.userRule
      } else {
        this.userRule = {calcs: [], nodeType: this.curNode.type}
      }

      let this_ = this
      req
        .get(
          window.context.bpmModel +
            '/flow/node/usercalc/v1/getNodeUserPluginList'
        )
        .then(function (respose) {
          let data = respose.data
          this_.nodeUserPluginList = data
          //配置节点人员不显示可以选择【脚本】功能
          for (var i = 0; i < this_.nodeUserPluginList.length; i++) {
            if (this_.nodeUserPluginList[i].title == '脚本') {
              this_.nodeUserPluginList.splice(i, 1)
              break
            }
          }
          this_.conditionObj = {}
          if (param && param.userRule && param.userRule.condition) {
            //初始化
            if (typeof param.userRule.condition == 'string') {
              this_.conditionObj = JSON.parse(param.userRule.condition)
            } else {
              this_.conditionObj = JSON.parse(
                JSON.stringify(param.userRule.condition)
              )
            }
          } else {
            this_.conditionObj = {junction: 'and', condition: []}
          }
          this_.buildConditionTree(this_.conditionObj)
        })
      this.dialogVisible = true
    },
    handleClose: function () {
      var r = {}
      if (
        !this.userRule.calcs ||
        this.userRule.calcs.length == 0 ||
        !this.validateData(this.userRule.calcs)
      ) {
        this.$message.error('请设置节点审批人员！')
        return false
      }

      let conditionJson = JSON.stringify(this.conditionObj)
      r.condition = conditionJson
      r.conditionMode = ''
      r.name = ''
      r.nodeType = this.userRule.nodeType
      r.parentFlowKey = ''
      r.calcs = this.userRule.calcs
      //拼装描述
      r.description = ''
      for (const c of r.calcs) {
        switch (c.pluginType) {
          case 'org':
            c.description = '[部门]' + c.orgName
            break
          case 'position':
            c.description = '[岗位]' + c.posName
            break
          case 'job':
            c.description = '[职务]' + c.jobName
            break
          case 'role':
            c.description = '[角色]' + c.roleName
            break
        }
        if (r.description) {
          if (c.logicCal == 'or') {
            r.description += '(或)'
          } else if (c.logicCal == 'and') {
            r.description += '(与)'
          } else {
            r.description += '(非)'
          }
        }
        r.description += c.description
      }
      this.$emit('nodeUserConditionConfirm', r)
      this.dialogVisible = false
    },
    cuserSelectorConfirm(selection) {
      this.userRule.calcs.splice(this.curEditIndex, 1, selection)
    },
    positionSelectorConfirm(selection) {
      this.userRule.calcs.splice(this.curEditIndex, 1, selection)
    },
    scriptSelectorConfirm(selection) {
      let calcs = {...this.userRule.calcs[this.curEditIndex], ...selection}
      calcs.description = '[人员脚本]' + selection.desc
      calcs.scriptId = selection.scriptId
      this.userRule.calcs.splice(this.curEditIndex, 1, calcs)
    },
    customQuerySelectorConfirm(selection) {
      let calcs = {...this.userRule.calcs[this.curEditIndex], ...selection}
      calcs.description = '[关联查询]' + selection.desc
      calcs.alias = selection.alias
      calcs.name = selection.name
      this.userRule.calcs.splice(this.curEditIndex, 1, calcs)
    },
    matrixSelectorConfirm(selection) {
      let calcs = {...this.userRule.calcs[this.curEditIndex], ...selection}
      calcs.description = '[角色矩阵]' + selection.desc
      calcs.code = selection.code
      calcs.name = selection.name
      this.userRule.calcs.splice(this.curEditIndex, 1, calcs)
    },
    validateData(calcs) {
      let isTrue = true
      for (var i = 0; i < calcs.length; i++) {
        switch (calcs[i].pluginType) {
          case 'script':
          case 'hrScript':
            if (!calcs[i].script) isTrue = false
            break
          case 'sameNode':
            if (!calcs[i].nodeId) isTrue = false
            break
          case 'cusers':
            if (!calcs[i].description) isTrue = false
            break
          case 'org':
            if (!calcs[i].orgCode) isTrue = false
            break
          case 'job':
            if (!calcs[i].jobCode) isTrue = false
            break
          case 'role':
            if (!calcs[i].roleCode) isTrue = false
            break
        }
      }
      return isTrue
    },
    customScriptSelectorConfirm(result) {
      this.curEditTab.script = result
      this.curEditTab.conDesc = result
    },
    customRuleSelectorConfirm(result) {
      this.curEditTab.conDesc = result.conDesc
      this.curEditTab.executorVar = result.executorVar
      this.curEditTab.expression = result.expression
      this.curEditTab.dataType = result.dataType
    },
    editCondition(tab) {
      this.curEditTab = tab
      if (tab.ruleType == 2) {
        this.$refs.flowCustomScriptSelector.showDialog(tab.script || '')
      } else {
        this.$refs.flowNodeUserRuleSelector.showDialog(tab)
      }

      return
      var pageParam = $scope.$parent.pageParam.passConf
      if (tab.ruleType == 2) {
        pageParam.script = tab.script
        dialogService
          .page('flow-customScript', {
            area: ['800px', '480px'],
            pageParam: pageParam,
          })
          .then(function (result) {
            tab.script = result
            tab.conDesc = result
          })
      } else {
        pageParam.data = angular.copy(tab)
        dialogService
          .page('flow-varDailog', {
            area: ['800px', '480px'],
            pageParam: pageParam,
          })
          .then(function (result) {
            tab.conDesc = result.conDesc
            tab.executorVar = result.executorVar
            tab.expression = result.expression
            tab.dataType = result.dataType
          })
      }
    },
    changeSameNode(calc) {
      this.nodeList.forEach((node) => {
        if (node.nodeId == calc.nodeId) {
          calc.description = '[节点]' + node.name
        }
      })
    },
  },
}
</script>

<style  scoped>
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
.table {
  border-bottom: 1px solid #e7eaec;
  border-right: 1px solid #e7eaec;
  border-spacing: 0;
}
.table >>> .el-button {
  padding: 6px 8px;
  margin-left: 0px;
  margin-right: 5px;
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
</style>
