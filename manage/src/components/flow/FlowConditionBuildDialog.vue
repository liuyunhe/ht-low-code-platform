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
      <span slot="title" style="font-size: 20px">
        {{ title }}
        <el-tooltip placement="right">
          <div slot="content">
            字符串和数字的比较类型为【属于】时，值内容要以英文逗号隔开
          </div>
          <i class="el-icon-question" />
        </el-tooltip>
      </span>
      <div style="position: relative; height: 450px; overflow: auto">
        <div style="position: absolute; z-index: 2">
          <form data-vv-scope="form1" v-form>
            <el-container v-if="!bindForm">
              <div class="form-empty">请先绑定业表单</div>
            </el-container>
            <table
              class="table-list custom_condition_tab table"
              :style="tab.style"
              v-for="tab in tabList"
              :key="tab.indexStr"
            >
              <tbody>
                <tr>
                  <td style="width: 220px">
                    <el-select
                      v-model="tab.property"
                      v-validate="{required: true}"
                      @change="setFieldOtherInfo(this, tab, 1)"
                      style="width: 200px"
                      size="mini"
                    >
                      <el-option-group
                        :label="fields.desc"
                        v-for="(fields, $index) in varTree"
                        :key="$index"
                      >
                        <el-option
                          :value="m.pathStr"
                          :label="m.desc"
                          v-for="m in fields.children"
                          :key="m.pathStr"
                        ></el-option>
                      </el-option-group>
                    </el-select>
                  </td>
                  <td style="width: 100px">
                    <el-select
                      v-model="tab.operator"
                      style="width: 100px"
                      size="mini"
                    >
                      <el-option label="等于" value="1"></el-option>
                      <el-option label="不等于" value="2"></el-option>
                      <el-option
                        label="大于"
                        v-if="
                          tab.dataType == 'date' || tab.dataType == 'number'
                        "
                        value="3"
                      ></el-option>
                      <el-option
                        label="大于等于"
                        v-if="
                          tab.dataType == 'date' || tab.dataType == 'number'
                        "
                        value="7"
                        >大于等于</el-option
                      >
                      <el-option
                        label="小于"
                        v-if="
                          tab.dataType == 'date' || tab.dataType == 'number'
                        "
                        value="4"
                      ></el-option>
                      <el-option
                        label="小于等于"
                        v-if="
                          tab.dataType == 'date' || tab.dataType == 'number'
                        "
                        value="8"
                        >小于等于</el-option
                      >
                      <el-option
                        label="包含"
                        v-if="tab.dataType == 'varchar'"
                        value="5"
                        >包含</el-option
                      >
                      <el-option
                        label="不包含"
                        v-if="tab.dataType == 'varchar'"
                        value="6"
                        >不包含</el-option
                      >
                      <el-option label="属于" value="9">属于</el-option>
                    </el-select>
                  </td>
                  <td style="width: 100px">
                    <el-select
                      v-model="tab.compType"
                      class="selected_search"
                      @change="tab.value = ''"
                    >
                      <el-option label="值" value="1"></el-option>
                      <el-option label="属性" value="2"></el-option>
                    </el-select>
                  </td>
                  <td v-show="tab.compType == '2'" style="width: 220px">
                    <el-select
                      v-model="tab.value"
                      :validate="{required: true}"
                      @change="setFieldOtherInfo(this, tab, 2)"
                      style="width: 200px"
                      size="mini"
                    >
                      <el-option-group
                        :label="fields.desc"
                        v-for="(fields, $index) in varTree"
                        :key="$index"
                      >
                        <el-option
                          :value="m.pathStr"
                          v-show="IsShowfiled(m, tab)"
                          :label="m.desc"
                          v-for="m in fields.children"
                          :key="m.pathStr"
                        ></el-option>
                      </el-option-group>
                    </el-select>
                  </td>
                  <td
                    v-if="tab.compType != '2' && tab.dataType == 'date'"
                    style="width: 220px"
                  >
                    <ht-date
                      v-if="tab.operator != '9'"
                      v-model="tab.value"
                      style="width: 215px"
                      :validate="{required: true}"
                      :format="tab.format"
                      :showDate="true"
                      :day="-3"
                    />
                    <el-date-picker
                      v-if="tab.operator == '9'"
                      v-model="tab.value"
                      :format="tab.format"
                      :value-format="tab.format"
                      :validate="{required: true}"
                      type="datetimerange"
                      range-separator="至"
                      start-placeholder="开始日期"
                      end-placeholder="结束日期"
                    >
                    </el-date-picker>
                  </td>

                  <td
                    v-if="tab.compType != 2 && tab.dataType != 'date'"
                    style="width: 220px"
                  >
                    <ht-input
                      style="width: 203px"
                      v-model="tab.value"
                      :validate="{required: true}"
                    />
                  </td>
                  <td style="width: 60px">
                    <el-button
                      @click="removeCondition(tab.indexStr)"
                      size="mini"
                      icon="el-icon-delete"
                    ></el-button>
                  </td>
                </tr>
              </tbody>
            </table>
          </form>
          <div
            class="labelrag"
            :style="branch.style"
            v-for="(branch, $index) in branchList"
            :key="branch.indexStr"
          >
            <el-select
              v-model="branch.newjunction"
              class="selected_search"
              @change="changecondition($index)"
            >
              <el-option label="并且" value="and"></el-option>
              <el-option label="或者" value="or"></el-option>
              <el-option label="添加条件" value="3"></el-option>
              <el-option
                label="添加联合条件"
                value="4"
                v-if="branch.condition != 'noAdd'"
              ></el-option>
              <el-option
                label="删除"
                value="5"
                v-if="branch.condition != 'noDel'"
              ></el-option>
            </el-select>
          </div>
        </div>
        <div
          v-html="svgHtml"
          style="position: absolute; z-index: 1; width: 500px; height: 100%"
        ></div>
      </div>
      <span slot="footer" class="dialog-footer">
        <el-input
          v-if="bindForm"
          type="textarea"
          :rows="2"
          readonly
          v-model="scriptStr"
        ></el-input>
        <div>
          <el-button
            v-if="bindForm"
            type="primary"
            @click="previewCondition(false)"
            size="medium"
            >预览表达式</el-button
          >
          <el-button
            v-if="bindForm"
            type="primary"
            @click="previewCondition(true)"
            size="medium"
            >确 定</el-button
          >
          <el-button @click="dialogVisible = false" size="medium"
            >取 消</el-button
          >
        </div>
      </span>
    </el-dialog>
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

export default {
  components: {
    FlowNodeCusersSelector,
    eipOrgSelector,
    eipJobSelector,
    eipPostSelector,
    FlowHrScriptSelector,
  },
  props: ['defId', 'value'],
  data() {
    return {
      userConditionTab: 'first',
      dialogVisible: false,
      title: '条件脚本设置',
      conditionList: [],
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
        compType: '1',
      },
      Mleft: 50, //初始左边距50
      Mtop: 20, //初始上边距40
      XIncase: 100, //x轴递增数值70
      YIncase: 50, //y轴递增数据50
      svgHtml: '',
      varTree: [],
      filedsObj: {},
      scriptStr: '',
      bindForm: true,
    }
  },
  computed: mapState({
    defConfigData: (state) => state.flow.defConfigData,
  }),
  methods: {
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
      if (type != 'cusers' && type != 'hrScript') {
        this.$message.error('没有其他类型的选择器，暂时只能选用户')
        return
      }
      eval('this.' + calc.pluginType + 'Selector(calc);')
    },
    cusersSelector: function (calc) {
      let param = {...this.parentParam, calc: calc}
      this.$refs.flowNodeCusersSelector.showDialog(param)
    },
    hrScriptSelector: function (calc) {
      let param = {...this.parentParam, calc: calc}
      this.$refs.flowHrScriptSelector.showDilaog(param)
    },
    showDialog: function (param) {
      param = param || {}
      let this_ = this
      this.svgHtml = ''
      this.scriptStr = ''
      req
        .post(window.context.bpmModel + '/flow/node/v1/varTree', {
          defId: this.defId,
          removeSub: true,
        })
        .then(function (respose) {
          let treeData = respose.data
          if (
            treeData &&
            treeData.constructor == Array &&
            treeData.length > 0
          ) {
            this_.conditionObj = {junction: 'and', condition: []}
            this_.buildConditionTree(this_.conditionObj)
            this_.buildVarTree(treeData)
          } else if (treeData && treeData.constructor == Array) {
            this_.$message.error('请先绑定业表单')
            this_.bindForm = false
          } else {
            this_.$message.error('请求错误')
          }
          this_.dialogVisible = true
        })
    },
    buildVarTree(treeData) {
      var treeArr = []
      for (var i = 0, t; (t = treeData[i++]); ) {
        //处理表单变量
        if (t && t.name == '表单变量') {
          if (t.children) {
            for (var j = 0, tChild; (tChild = t.children[j++]); ) {
              if (tChild.children) {
                for (var z = 0, cAttr; (cAttr = tChild.children[z++]); ) {
                  var typeMoth =
                    cAttr.dataType == 'number' ? '.getDouble' : '.getString'
                  cAttr.pathStr =
                    tChild.path + typeMoth + '("' + cAttr.name + '")'
                  this.filedsObj[cAttr.pathStr] = cAttr
                }
                treeArr.push(tChild)
              }
            }
          }
        } else if (t && t.name == 'url表单变量') {
          if (t.children) {
            for (var j = 0, tChild; (tChild = t.children[j++]); ) {
              if (tChild.attrs) {
                for (var z = 0, cAttr; (cAttr = tChild.attrs[z++]); ) {
                  cAttr.path = tChild.formKey
                  if (cAttr.dataType == 'number') {
                    cAttr.pathStr =
                      cAttr.path + '.getIntValue("' + cAttr.name + '")'
                  } else {
                    cAttr.pathStr =
                      cAttr.path + '.getString("' + cAttr.name + '")'
                  }
                  this.filedsObj[cAttr.pathStr] = cAttr
                }
                tChild.children = tChild.attrs
                tChild.desc = tChild.name
                delete tChild.attrs
                treeArr.push(tChild)
              }
            }
          }
        }
      }
      if (treeArr.length > 0) {
        this.varTree = treeArr
      } else {
        dialogService.fail('请先绑定业表单')
        this_.bindForm = false
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
    IsShowfiled(m, tab) {
      if (!tab) return false
      if (m.pathStr == tab.property) {
        return false
      } else if (m.dataType != tab.dataType) {
        return false
      }
      return true
    },
    previewCondition(isConfirm) {
      utils
        .validateForm(this, 'form1')
        .then((r) => {
          if (!this.conditionObj) return
          var data = this.getConditionStr(this.conditionObj)
          data.conditionObj = JSON.stringify(this.conditionObj)
          this.scriptStr = data.conditionString
          if (isConfirm) {
            this.$emit('input', this.scriptStr)
            this.$emit('onConfirm', this.scriptStr)
            this.dialogVisible = false
          }
        })
        .catch((items) => {
          this.$message.error(`还有内容未填写，无法生成表表达式。`)
        })
        .finally(() => {
          this.loading = false
        })
    },
    getConditionStr(obj) {
      if (!obj || !obj.condition) return
      var returnData = {}
      var data = obj.condition
      var res = ''
      var desString = ''
      for (var i = 0; i < data.length; i++) {
        //第一节点的表达式
        var curcondStr1 = ''
        var curcondDes1 = ''
        //如果第一节点有分支则计算
        if (data[i].condition && data[i].condition.length > 0) {
          curcondStr1 += '('
          curcondDes1 += '('
          for (var j = 0; j < data[i].condition.length; j++) {
            //第二节点的表达式
            var curcondStr2 = ''
            var curcondDes2 = ''
            //如果第三级节点有分支，则计算分支
            if (
              data[i].condition[j].condition &&
              data[i].condition[j].condition.length > 0
            ) {
              curcondStr2 += '('
              curcondDes2 += '('
              var curcondStr3 = ''
              var curcondDes3 = ''
              for (var z = 0; z < data[i].condition[j].condition.length; z++) {
                curcondStr3 = this.getConditionStrByObj(
                  data[i].condition[j].condition[z]
                )
                curcondDes3 = this.getConditionStrByObj(
                  data[i].condition[j].condition[z],
                  'des'
                )
                if (curcondStr3 != '') {
                  //循环拼接第三节点的条件
                  if (z == 0) {
                    //第一个不拼接运算符
                    curcondStr2 += curcondStr3
                    curcondDes2 += curcondDes3
                  } else {
                    curcondStr2 +=
                      this.getjunction(data[i].condition[j].junction) +
                      curcondStr3
                    curcondDes2 +=
                      this.getjunction(data[i].condition[j].junction) +
                      curcondDes3
                  }
                }
              }
              curcondStr2 += ')'
              curcondDes2 += ')'
            } else if (data[i].condition[j].property) {
              //第二节点没有分只
              curcondStr2 = this.getConditionStrByObj(data[i].condition[j])
              curcondDes2 = this.getConditionStrByObj(
                data[i].condition[j],
                'des'
              )
            }
            if (curcondStr2 != '') {
              //循环拼接第二节点的条件
              if (j == 0) {
                //第一个不拼接运算符
                curcondStr1 += curcondStr2
                curcondDes1 += curcondDes2
              } else {
                curcondStr1 += this.getjunction(data[i].junction) + curcondStr2
                curcondDes1 += this.getjunction(data[i].junction) + curcondDes2
              }
            }
          }
          curcondStr1 += ')'
          curcondDes1 += ')'
        } else if (data[i].property) {
          //第一节点没有分只
          curcondStr1 = this.getConditionStrByObj(data[i])
          curcondDes1 = this.getConditionStrByObj(data[i], 'des')
        }
        if (curcondStr1 != '') {
          //循环拼接第一节点的条件
          if (i == 0) {
            //第一个不拼接运算符
            res += curcondStr1
            desString += curcondDes1
          } else {
            res += this.getjunction(obj.junction) + curcondStr1
            desString += this.getjunction(obj.junction) + curcondDes1
          }
        }
      }
      returnData.conditionString = res
      returnData.conditionDes = desString
      return returnData
    },
    getjunction(str) {
      var res = ''
      switch (str) {
        case 'and':
          res = ' && '
          break
        case 'or':
          res = ' || '
          break
      }
      return res
    },
    getConditionStrByObj(obj, type) {
      var res = ''
      switch (obj.dataType) {
        case 'varchar':
          res = this.buildStringCondition(obj, type)
          break
        case 'date':
          res = this.buildDateCondition(obj, type)
          break
        case 'number':
          res = this.buildIntCondition(obj, type)
          break
      }
      return res
    },
    buildDateCondition(obj, type) {
      var value = obj.value
      var valueDes = ''
      var property = obj.property
      let res = ''
      if (obj.compType == 1) {
        value = '"' + obj.value + '"'
        valueDes = value
      } else {
        valueDes = obj.changeDesc
      }
      if (type == 'des') {
        property = obj.chooseDesc
        value = valueDes
        switch (obj.operator) {
          case '1':
            res = property + '==' + value
            break
          case '2':
            res = property + '!=' + value
            break
          case '3':
            res = property + '>' + value
            break
          case '4':
            res = property + '<' + value
            break
        }
      } else {
        switch (obj.operator) {
          case '1':
            res = 'scriptImpl.isDateEquals(' + property + ',' + value + ')'
            break
          case '2':
            res = '!scriptImpl.isDateEquals(' + property + ',' + value + ')'
            break
          case '3':
            res = 'scriptImpl.isDateLarge(' + property + ',' + value + ')'
            break
          case '4':
            res = 'scriptImpl.isDateLittle(' + property + ',' + value + ')'
            break
          case '7':
            res = 'scriptImpl.isDateLargeEquals(' + property + ',' + value + ')'
            break
          case '8':
            res =
              'scriptImpl.isDateLittleEquals(' + property + ',' + value + ')'
            break
          case '9':
            res = 'scriptImpl.isDateBelongTo(' + property + ',' + value + ')'
            break
        }
      }

      return res
    },
    buildStringCondition(obj, type) {
      var value = obj.value
      var valueDes = ''
      var property = obj.property
      let res = ''
      if (obj.compType == 1) {
        value = '"' + obj.value + '"'
        valueDes = value
      } else {
        valueDes = obj.changeDesc
      }
      if (type == 'des') {
        property = obj.chooseDesc
        value = valueDes
        switch (obj.operator) {
          case '1':
            res = property + '==' + value
            break
          case '2':
            res = property + '!=' + value
            break
          case '3':
            res = property + '>' + value
            break
          case '4':
            res = property + '<' + value
            break
          case '5':
            res = property + 'contains' + value
            break
          case '6':
            res = property + '! contains' + value
            break
        }
      } else {
        switch (obj.operator) {
          case '1':
            res = 'scriptImpl.equals(' + property + ',' + value + ')'
            break
          case '2':
            res = '!scriptImpl.equals(' + property + ',' + value + ')'
            break
          case '3':
            res = 'scriptImpl.LargeThen(' + property + ',' + value + ')'
            break
          case '4':
            res = 'scriptImpl.littleThen(' + property + ',' + value + ')'
            break
          case '5':
            res = 'scriptImpl.contains(' + property + ',' + value + ')'
            break
          case '6':
            res = '!scriptImpl.contains(' + property + ',' + value + ')'
            break
          case '9':
            res = 'scriptImpl.isStringBelongTo(' + property + ',' + value + ')'
            break
        }
      }

      return res
    },
    buildIntCondition(obj, type) {
      var value = obj.value
      var valueDes = ''
      var property = obj.property
      if (obj.compType == 1) {
        value = obj.value
        valueDes = value
      } else {
        valueDes = obj.changeDesc
      }
      if (type == 'des') {
        property = obj.chooseDesc
        value = valueDes
      }
      var res = ''
      switch (obj.operator) {
        case '1':
          res = property + '==' + value
          break
        case '2':
          res = property + '!=' + value
          break
        case '3':
          res = property + '>' + value
          break
        case '4':
          res = property + '<' + value
          break
        case '7':
          res = property + '>=' + value
          break
        case '8':
          res = property + '<=' + value
          break
        case '9':
          // res = "scriptImpl.isNumberBelongTo(" + property + ",\"" + value + "\")";
          let valueArr = value.split(',')
          res = `(${property}>=${valueArr[0]} && ${property}<=${valueArr[1]})`
          break
      }
      return res
    },
    handleClose: function () {
      utils
        .validateForm(this, 'form1')
        .then((r) => {
          this.$message.success(JSON.stringify(this.data))
        })
        .catch((items) => {
          this.$message.error(`还有内容未填写，无法生成表表达式。`)
        })
        .finally(() => {
          this.loading = false
        })
    },
    cuserSelectorConfirm(selection) {
      this.userRule.calcs.splice(this.curEditIndex, 1, selection)
    },
    scriptSelectorConfirm(selection) {
      let calcs = {...this.userRule.calcs[this.curEditIndex], ...selection}
      calcs.description = '[人员脚本]' + selection.desc
      calcs.scriptId = selection.scriptId
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
        }
      }
      return isTrue
    },
    editCondition(tab) {
      this.$message.error('研发中，敬请期待！')
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
  },
  created() {
    this.$validator = this.$root.$validator
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

.form-empty {
  position: absolute;
  text-align: center;
  width: 300px;
  font-size: 20px;
  top: 200px;
  margin-left: 400px;
  color: #ccc;
}
</style>
