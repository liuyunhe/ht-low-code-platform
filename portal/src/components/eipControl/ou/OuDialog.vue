<template>
  <div class="inputs">
    <!-- TODO:显示的本体,input+button -->
    <el-tooltip
      :placement="tooltipplacement || $tooltipplacement"
      :disabled="inputWriteable && !errors.has('custom-form.' + inputName)"
    >
      <div slot="content">{{ errors.first('custom-form.' + inputName) }}</div>
      <div style="width: 100%">
        <!-- 输入的input -->
        <!-- 这里的逻辑应该是这样的:
           不求维护inputVal和formatVal中的同步
           只要input获得焦点再逻辑判断formatVal中的数据，因为JSON
           表示，凡是手动输入的树统一使用isHandle:true表示！
         -->
        <div class="el-input el-input--suffix" v-if="isHandle">
          <input
            type="text"
            ref="handleInput"
            v-model="inputVal"
            autocomplete="off"
            placeholder="输入多个值请用,分隔"
            class="el-input__inner"
            @blur.self="handleBlur"
          />
        </div>
        <div v-else style="position: relative">
          <!-- el-tag -->
          <!-- <el-tag type="info" v-for="(item, index) in formatVal" :key="index" closable @click="removeSelectOrg(index)">
            {{item.value}}
          </el-tag> -->
          <div
            class="el-select__tags"
            ref="tagSpans"
            :style="{width: 'calc(100% - ' + inputSuffixWidth + 'px)'}"
          >
            <span @click.self="handleFocus">
              <span
                class="el-tag el-tag--info el-tag--small"
                style="margin-right:10px;"
                v-for="(item, index) in formatVal"
                :key="index"
              >
                <span class="el-select__tags-text">{{ item.value }}</span>
                <i
                  class="el-tag__close el-icon-close"
                  @click="removeSelectOrg(item)"
                ></i>
              </span>
            </span>
          </div>
          <!-- el-input  设置两个,一个显示使用,一个手动输入时启用-->
          <div class="el-input el-input--suffix">
            <!--          input在对话框选中后禁用-->
            <input
              type="text"
              ref="exhibitInput"
              v-validate="inputValidate"
              autocomplete="off"
              class="el-input__inner"
              :placeholder="placeholderBo"
              :name="inputName"
              @focus.self="handleFocus"
            />
            <span ref="inputSuffix" class="el-input__suffix">
              <span class="el-input__suffix-inner">
                <el-button
                  slot="append"
                  type="info"
                  size="mini"
                  @click="showDialog"
                >
                  <i
                    :class="
                      custdialog.icon
                        ? 'el-input__icon ' + custdialog.icon
                        : 'el-input__icon icon-department'
                    "
                    :style="{
                      fontSize: '17px',
                      lineHeight: inputSuffixHeight + 'px',
                    }"
                  ></i
                  >{{ custdialog.name }}</el-button
                >
              </span>
            </span>
          </div>
        </div>
      </div>
    </el-tooltip>
    <!-- 列表对话框 -->
    <el-dialog
      :visible.sync="customDialogShowList"
      :close-on-click-modal="false"
      :before-close="dialogCancel"
      append-to-body
      top="6vh"
      width="60%"
      @opened="afterOpen"
    >
      <template slot="title">
        <div>
          <span style="font-size: 16px; marin-right: 15px">{{
            customDialog.name
          }}</span>
          <el-tooltip
            popper-class="title-tooltip"
            style="margin-left: 6px"
            v-if="openDialogNotes"
            :content="dialogNotesContent"
            placement="right-end"
          >
            <i class="property-tip icon-question" />
          </el-tooltip>
        </div>
      </template>
      <el-container :style="style" style="overflow: auto">
        <!-- TODO:组合对话框树 -->
        <el-aside width="width:23%;" v-if="customDialog.style == 2"></el-aside>
        <!-- 组合对话框时左侧的树和右侧的table数据有一条分割线 -->
        <el-divider
          direction="vertical"
          v-if="customDialog.style == 2"
        ></el-divider>
        <el-container>
          <el-header class="middle-header" v-if="queryShow">
            <!-- TODO:search details -->
          </el-header>
          <el-main style="padding: 0">
            <el-table
              :data="dialogData"
              ref="orgTable"
              stripe
              border
              @row-click="orgRowClick"
              @selection-change="orgTableSelection"
              @select="onTableSelect"
              @select-all="selectAll"
              class="org-table"
              size="medium"
              style="width: 100%"
            >
              <!-- 选择框 -->
              <el-table-column
                type="selection"
                align="center"
                width="45"
                v-if="customDialog.selectNum != 1"
              ></el-table-column>
              <!--单选框 -->
              <el-table-column
                align="center"
                width="50"
                v-if="customDialog.selectNum === 1"
              >
                <template slot-scope="scope">
                  <el-radio
                    @change="orgTableRadioChange"
                    :label="scope.$index"
                    v-model="radioVal"
                    class="textRadio"
                    >&nbsp;</el-radio
                  >
                </template>
              </el-table-column>
              <!-- 序号：逻辑排序 -->
              <el-table-column
                type="index"
                width="65"
                align="center"
                label="序号"
              >
                <template slot-scope="scope">
                  <span>{{
                    (pagination.page - 1) * pagination.pageSize +
                    scope.$index +
                    1
                  }}</span>
                </template>
              </el-table-column>
              <!-- 展示的字段 -->
              <el-table-column
                :show-overflow-tooltip="true"
                v-for="field in displayfield"
                :key="field.field"
                :prop="field.field"
                :label="field.comment"
                style="width: 100%"
              ></el-table-column>
            </el-table>
          </el-main>
          <el-footer>
            <el-row
              type="flex"
              justify="end"
              style="padding-top: 15px; justify-content: space-between"
              v-if="this.customDialog.needPage"
            >
              <el-button
                @click="toggleTree"
                :icon="toggleBtn"
                size="mini"
                type="default"
                v-if="customDialog.style == 2"
              ></el-button>
              <el-pagination
                small
                @size-change="handleSizeChange"
                @current-change="handleCurrentChange"
                :current-page="pagination.page"
                :page-sizes="[10, 20, 50, 100]"
                :page-size="pagination.pageSize"
                layout="total, sizes, prev, pager, next, jumper"
                :total="total"
              ></el-pagination>
            </el-row>
          </el-footer>
        </el-container>
      </el-container>
      <span slot="footer" class="dialog-footer" style="text-align: center">
        <el-button size="small" type="primary" @click="dialogConfirm"
          >确认</el-button
        >
        <el-button size="small" @click="dialogCancel">取 消</el-button>
      </span>
    </el-dialog>
    <!-- TODO:树形对话框 -->
  </div>
</template>
<script>
import {mapState} from 'vuex'
import utils from '@/utils.js'
import hotentUiUtils from '@/hotent-ui-util.js'
import {Message} from 'element-ui'
import req from '@/request.js'
import sub_pio_mixin from '@/sub-permission-mixin.js'
import EipTag from '@/components/eipControl/EipTag.vue'
import EipSelectDia from '@/components/eipControl/EipSelectDia.vue'
export default {
  name: 'ou-dialog',
  props: [
    'validate',
    'value',
    'name',
    'permission',
    'atter',
    'single',
    'selectorconfig',
    'custdialog',
    'placeholder',
    'tooltipplacement',
    'expandAll',
    'openDialogNotes',
    'dialogNotesContent',
  ],
  model: {
    prop: 'value',
    event: 'input',
  },
  mixins: [sub_pio_mixin],
  data() {
    return {
      inputVal: '', //手动输入进入的值
      lockInputVal: false,
      isHandle: false, //正在手填?
      dialogVisible: false, //打开树形输入动态参数值的对话框
      pageParam: {}, //树形对话框参数
      conditionFieldTree: [], //树形对话框条件字段
      data: {
        qxdd: {},
      },
      inputSuffixWidth: 0,
      placeholderBo: '',
      quickSearch: '', //填写提示
      conditionBind: [], //参数查询字段
      nodeKey: 'ID_', //树形数据父Id
      customDialogShowList: false,
      customDialogShowTree: false,
      selectOrgProps: {
        label: 'name',
      },
      style: '', //对话框宽高
      selectOrgs: null,
      inputSuffixHeight: 33,
      config: null,
      updating: false,
      displayfield: [], //显示字段
      customDialog: {},
      queryParam: '', //查询条件输入的值
      props1: [],
      showData: [],
      checkBoxDataAll: [], //选中对象的集合
      //树形控件el-tree使用
      defaultProps: {
        children: 'children',
        label: 'label',
        isLeaf: 'isLeaf',
      },
      propsData: [],
      queryShow: false, //是否显示搜索框
      radioVal: '',
      isCurrentChange: false, //是否不执行 orgTableSelection方法
      pagination: {
        page: 1,
        pageSize: 10,
        total: 0,
      },
      param: [], //绑定的表单字段
      treeList: [],
      displayFieldList: {},
      queryParams: [],
      placeholders: [],
      oldSelectOrgs: [],
      combinationTreeData: [],
      combinationTreeDisplayField: [],
      combinationTreeQuery: [],
      combinationRule: {},
      toggleBtn: 'el-icon-arrow-left',
      treeShow: true,
      transitionWidth: '25%',
      leftTreeTitle: '',
      writeable: true, //是否可写
      input_: false,
    }
  },
  watch: {},
  computed: {
    ...mapState({
      total: (state) => state.dialog.total,
      dialogData: (state) => state.dialog.rows,
    }),
    inputWriteable: function () {
      return this.writeable
        ? utils.getWriteable(this.permission_sub)
        : this.writeable
    },
    inputValidate: function () {
      var validateObj = this.$store.state.index.validate
      return utils.addRequiredOrNot(
        this.permission_sub,
        this.validate,
        validateObj,
        this
      )
    },
    inputName: function () {
      let labeldesc = ''
      if (
        this.$slots &&
        this.$slots.labeldesc &&
        this.$slots.labeldesc[0].children &&
        this.$slots.labeldesc[0].children[0].text
      ) {
        labeldesc = this.$slots.labeldesc[0].children[0].text
        return this.name ? this.name : utils.getName() + '-' + labeldesc
      } else {
        return this.name ? this.name : utils.getName()
      }
    },
    //参考附件控件的逻辑，formatVal和value的同步
    formatVal: {
      get() {
        if (this.value && this.value.constructor === String) {
          try {
            return JSON.parse(this.value)
          } catch {
            const valList = this.value.split(',')
            return valList.map((val) => {
              return {
                value: val,
                isHandle: false,
                raw: this.raw || this.value || '',
              }
            })
          }
        }
        return []
      },
      set(val) {
        // debugger
        let r = null
        if (val && val.constructor === Array) {
          r = JSON.stringify(val)
          this.$emit('input', r)
          if (!this.lockInputVal) {
            const valList = val.map((item) => item.value)
            // this.inputVal = valList.join(',')
          }
        }
        this.lockInputVal = false
      },
    },
    //对话框可能并不绑定数据,只用于展示数据，某种格式上的;
    //TODO:开发multi-tag组件
    onlyShow() {
      return !this.custdialog.custDialog.hasOwnProperty('alias')
    },
  },
  created() {
    if (!this.placeholder) {
      this.placeholderBo = '请选择内容'
    } else {
      this.placeholderBo = this.placeholder
    }
    this.$validator = this.$root.$validator
  },
  mounted() {
    const {subScopeEl, index} = hotentUiUtils.getSubScopeElAndIndex(this.$el)
    console.log(subScopeEl, index, this.$el)
    if (
      subScopeEl &&
      (subScopeEl.getAttribute('row_readonly') == 'true' ||
        subScopeEl.getAttribute('row_readonly') === true)
    ) {
      this.writeable = false
    }
    //TODO:获取对话框按钮名称宽度
  },
  methods: {
    showDialog(item) {
      var alias = this.custdialog.custDialog.alias
      this.$store.dispatch('form/getByAlias', alias).then((customDialog) => {
        if (!customDialog || !customDialog.alias) {
          Message.error('对话框别名【' + alias + '】不存在！')
          return
        }
        if (customDialog.style == 1) {
          var displayList = JSON.parse(customDialog.displayfield)
          this.displayfield = displayList
          this.nodeKey = displayList.id
        }
        //对话框按表单字段查询（参数传入的）
        let bindList = this.custdialog.custDialog.conditions
        this.param = [] //绑定的表单字段
        if (bindList.length > 0) {
          bindList.forEach((ele) => {
            //绑定表单字段
            if (ele.defaultType == '3' && ele.bind) {
              let obj = {}
              obj.field = ele.field
              obj.bind = ele.bind
              this.param.push(obj)
            }
          })
        }
        //判断对话框查询是否有条件
        let userInputList = JSON.parse(customDialog.conditionfield)
        this.quickSearch = '' //填写提示 placeholder
        this.conditionBind = []
        let queryParams = []
        let placeholders = []
        if (userInputList.length > 0) {
          userInputList.forEach((ele) => {
            var obj = {}
            //条件查询参数（用户输入的） 文本框输入
            if (ele.defaultType == '1') {
              obj[ele.field] = ''
              queryParams.push(obj)
              this.conditionBind.push(ele)
              placeholders.push('请输入' + ele.comment)
            }
          })
          this.$set(this, 'queryParams', queryParams)
          this.$set(this, 'placeholders', placeholders)
        }
        //判断是否显示条件查询输入框
        if (this.quickSearch != '') {
          this.queryShow = true
        } else {
          this.queryShow = true
        }
        this.quickSearch = '请输入' + this.quickSearch + '查询'
        this.style = 'height:' + customDialog.height + 'px'
        if (window.screen.height && window.screen.height <= 900) {
          this.style = 'height:440px'
        }
        if (customDialog.style == 0 || customDialog.style == 2) {
          //列表对话框的
          this.customDialogShow({alias: alias, customDialog: customDialog})
        } else if (customDialog.style == 1) {
          //树形对话框的
          this.pageParam = {alias: alias, customDialog: customDialog}
          this.customDialog = customDialog
          this.customTreeDialogShow({alias: alias, customDialog: customDialog})
        }
      })
    },
    //列表对话框控制显示
    customDialogShow(pageParam) {
      this.customDialogShowList = true //显示列表对话框
      this.customDialog = pageParam.customDialog
      //链接拼接
      this.customDialog.queryUrl =
        this.customDialog.dsType == 'dataSource'
          ? '${form}/form/customDialog/v1/getListData?alias=' +
            this.customDialog.alias +
            '&mapParam=' +
            (this.customDialog.mapParam ? this.customDialog.mapParam : '')
          : this.customDialog.url
      if (this.dialogData.length < 1) {
        this.search()
        this.displayfield = JSON.parse(pageParam.customDialog.displayfield)
        if (this.customDialog.dsType == 'dataSource') {
          for (var i = 0; i < this.displayfield.length; i++) {
            this.displayfield[i].field =
              this.displayfield[i].field.toLowerCase()
          }
        }
      } else if (this.dialogData.length > 1) {
        this.search()
      }
      if (this.dialogData.length > 0 && this.displayfield.length == 0) {
        this.search()
        this.displayfield = JSON.parse(pageParam.customDialog.displayfield)
        if (this.customDialog.dsType == 'dataSource') {
          for (var i = 0; i < this.displayfield.length; i++) {
            this.displayfield[i].field =
              this.displayfield[i].field.toLowerCase()
          }
        }
      }
    },
    //树形对话框控制显示
    customTreeDialogShow(pageParam) {
      let param = {}
      this.conditionFieldTree = []
      //判断是否存在条件
      if (customDialog.conditionfield) {
        this.conditionFieldTree = JSON.parse(customDialog.conditionfield)
        if (this.conditionFieldTree.length > 0) {
          for (let i = this.conditionFieldTree.length - 1; i >= 0; i--) {
            //判断条件字段是否是动态传入（defaultType：4：动态传入，2：固定值 ）
            if (this.conditionFieldTree[i].defaultType == '4') {
              param[this.conditionFieldTree[i].field] =
                this.conditionFieldTree[i].comment
            }
          }
        }
      }
    },
    //查询
    search(resetPagination) {
      let querys = [] //查询条件
      let queryFilter = {}
      if (JSON.stringify(this.pagination) == '{}') {
        //空对象
        this.pagination = {page: '1', pageSize: '10', showTotal: 'true'}
      }
      let pageBean = {pageBean: this.pagination}
      if (resetPagination) {
        pageBean.pageBean = {page: '1', pageSize: '10', showTotal: 'true'}
      }
      //用户输入的查询拼接
      if (this.queryParams.length != 0 && this.queryParams[0] != '') {
        this.conditionBind.forEach((item, index) => {
          querys.push({
            property: item.field,
            value: this.queryParams[item.field],
            group: 'main',
            operation: 'LIKE',
            relation: 'AND',
          })
        })
      }
      //参数传入的查询拼接
      if (this.param) {
        const pInst = utils.getOnlineFormInstance(this)
        this.param.forEach((item) => {
          querys.push({
            property: item.field,
            value: utils.getValueByPath(pInst, item.bind),
            group: 'main',
            operation: 'LIKE',
            relation: 'AND',
          })
        })
      }
      //来自组合对话框的
      if (
        this.combinationTreeQuerys &&
        this.combinationTreeQuerys.length != 0
      ) {
        for (let i = 0; i < this.combinationTreeQuerys.length; i++) {
          querys.push(this.combinationTreeQuerys[i])
        }
      }
      if (querys.length > 0) {
        //查询参数有若干
        queryFilter = this.handlePostData({pageBean: pageBean.pageBean, querys})
        this.customDialog.pageBean = queryFilter
        this.$store
          .dispatch('dialog/getlistJson', this.customDialog)
          .then(() => {
            this.checkList()
          })
      } else {
        this.customDialog.pageBean = pageBean
        this.$store
          .dispatch('dialog/getlistJson', this.customDialog)
          .then(() => {
            this.checkList()
          })
      }
    },
    //重置
    reset() {
      this.queryParams.forEach((paramObj) => {
        for (let key in paramObj) {
          this.queryParams[key] = ''
        }
      })
      //TODO:组合树重置
    },
    checkList() {
      const that = this
      setTimeout(() => {
        if (
          this.checkBoxDataAll != undefined &&
          this.checkBoxDataAll.length > 0
        ) {
          this.checkBoxDataAll.forEach((row) => {
            let res = this.indexArray(this.dialogData, row)
            this.radioVal = res
            if (res != -1) {
              this.isCurrentChange = true
              //toggle selection
              this.toggleRowSelection(res, true)
            }
          })
        }
      }, 300)
    },
    //TODO:核心方法:值的同步逻辑
    syncInputValue() {
      let thisIndex = null //当前数据所在下标
      let parentIndex = null //父节点所在下标
      let hasGrand = false // ccwgq ===>判断是否存在孙表
      if (this.$el) {
        thisIndex = utils.getSomeAttributeFromParentElement(
          this.$el,
          'data-index'
        )
        parentIndex = utils.getSomeAttributeFromParentElement(
          this.$parent.$el,
          'data-index'
        )
      }
      var returnStr = ''
      if (this.customDialog.resultfield) {
        returnStr = JSON.parse(this.customDialog.resultfield)
      }
      //拿到返回的字段
      var field = new Array([returnStr.length])
      var comment = new Array([returnStr.length])
      var str = []
      for (var i = 0; i < returnStr.length; i++) {
        field[i] =
          this.customDialog.dsType == 'dataSource'
            ? returnStr[i].field.toLowerCase()
            : returnStr[i].field
        comment[i] =
          this.customDialog.dsType == 'dataSource'
            ? returnStr[i].comment.toLowerCase()
            : returnStr[i].comment
      }
      const that = this
      this.selectOrgs = this.selectOrgs === null ? [] : this.selectOrgs
      var s = this.selectOrgs || []
      this.showData = [...this.selectOrgs]
      this.checkBoxDataAll = [...this.selectOrgs]
      if (this.customDialog.selectNum === 1) {
        s = this.selectOrgs
      }
      if (this.customDialog.selectNum === 1) {
        //temp被处理为JSON字符串，通过一系列的拼接过程
        var temp = ''
        if (s && s.length > 0) {
          for (var i = 0; i < comment.length; i++) {
            let sField = s[0][field[i]] === undefined ? '' : s[0][field[i]]
            let encodeStr = encodeURIComponent(sField)
            temp += '"' + comment[i] + '":"' + encodeStr + '",'
          }
        }
        if (temp != '') {
          temp = '{' + temp.substring(0, temp.length - 1) + '}'
        }
        str.push(utils.parseToJson(temp))
      } else {
        for (var i = 0; i < s.length; i++) {
          var temp = ''
          for (var j = 0; j < comment.length; j++) {
            let encodeStr = encodeURIComponent(s[i][field[j]])
            temp += '"' + comment[j] + '":"' + encodeStr + '",'
          }
          if (temp != '') {
            temp = '{' + temp.substring(0, temp.length - 1) + '}'
          }
          str.push(utils.parseToJson(temp))
        }
      }
      const pInst = utils.getOnlineFormInstance(this)
      this.custdialog.custDialog.mappingConf.forEach((mapConf) => {
        var val = ''
        var from = ''
        if (this.customDialog.dsType === 'restful') {
          from = mapConf.from
        } else {
          from = mapConf.from.toLowerCase()
        }
        str.forEach((item) => {
          item = item || {}
          if (from in item && !!item[from]) {
            val += decodeURIComponent(item[from]) + ',' //多个值之间用，分隔
          }
        })
        //赋值，考虑主、子、孙
        if (this.atter === 'data.' + mapConf['target'][0]) {
          //回填自己,设置formatVal
          //TODO:这段代码没有测试过
          val = val.substring(0, val.length - 1)
          this.setValueSelf(val)
          // utils.setValueByPath(
          //   pInst,
          //   'data.' + mapConf['target'][0],
          //   val,
          //   thisIndex
          // )
        } else if (this.atter == 'searchForm.' + mapConf['target'][0]) {
          //TODO:这里是回填哪里的?
          utils.setValueByPath(
            pInst,
            'searchForm.' + mapConf['target'][0],
            val.substring(0, val.length - 1),
            thisIndex
          )
        } else {
          let configAttr = mapConf['target'][0].split('.')
          let path = mapConf['target'][0]
          hasGrand = configAttr.length === 4
          if (configAttr.length == 4 && parentIndex >= 0) {
            //孙表数据赋值
            path =
              configAttr[0] +
              '.' +
              configAttr[1] +
              '[' +
              parentIndex +
              '].' +
              configAttr[2] +
              '.' +
              configAttr[3]
          }
          let sonIndex = null
          let grandIndex = null
          if (hasGrand) {
            sonIndex = utils.getSonTableIndex(_this, configAttr, true)
            grandIndex = utils.getGrandTableIndex(_this, configAttr)
            path =
              configAttr[0] +
              '.' +
              configAttr[1] +
              '[' +
              sonIndex +
              '].' +
              configAttr[2] +
              '.' +
              configAttr[3]
          }
          if (pInst.data) {
            /*2022-04-15 ccwgq 解决对话框选择的值未及时渲染到
            页面的问题,模型数据已经修改，但可能由于嵌套过深了，
            深度监听都救不了，于是给inputVal强制赋值，达到视觉欺骗
            的效果*/
            const attr =
              $(this.$el).attr('model-name') ||
              $(this.$el).attr('model-expression') ||
              ''
            if (!!attr) {
              let needField = attr.split('.')
              needField = needField[needField.length - 1]
              let realField = path.split('.')
              realField = realField[realField.length - 1]
              if (needField === realField) {
                let valCopy = val
                //去除末尾多余的逗号
                if (/,$/.test(val)) {
                  valCopy = valCopy.substring(0, valCopy.length - 1)
                }
                // this.$emit('input', valCopy)
                this.setValueSelf(valCopy)
              }
            } else {
              utils.setValueByPath(
                pInst,
                'data.' + path,
                val.substring(0, val.length - 1),
                // thisIndex  //  原来的
                hasGrand ? grandIndex : thisIndex //ccwgq 修改赋值的方式   保证原来的thisIndex任然生效
              )
            }
          } else {
            utils.setValueByPath(
              pInst,
              'model.' + path,
              val.substring(0, val.length - 1),
              thisIndex
            )
          }
        }
      })
      // debugger
    },
    //回填值到自己,将,分割的值转为JSON结构
    setValueSelf(val) {
      var valList = val.split(',')
      var res = []
      valList.forEach((item, index) => {
        var obj = {}
        obj.value = item
        obj.isHandle = false
        obj.raw = this.selectOrgs[index]
        res.push(obj)
      })
      this.formatVal = res
    },
    toggleRowSelection(res, val) {
      this.$refs.orgTable.toggleRowSelection(this.dialogData[res], val)
    },
    //点击确认按钮
    dialogConfirm() {
      this.queryParam = ''
      this.customDialogShowList = false //关闭列表对话框
      this.input_ = false
      this.calacInputSuffixHeight()
      if (!this.onlyShow) {
        this.syncInputValue()
      }
      this.$store.dispatch('dialog/setDialogData', [])
    },
    //取消按钮
    dialogCancel() {
      const that = this
      that.queryParam = ''
      that.$store.dispatch('dialog/setDialogData', []).then(() => {
        that.customDialogShowList = false
        //TODO:判断是否是点击了确认再点击取消的  inputVal没有值则表示直接点击的取消
      })
    },
    //TODO:style高度计算
    calacInputSuffixHeight() {},
    afterOpen() {
      //打开对话框之后加载树
      this.loadCombinationTree()
    },
    loadCombinationTree() {},
    toggleTree() {},
    //判断数据是否包含某个对象，并返回数据包含对象的下标
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
    //remove one item
    removeSelectOrg(item) {
      //TODO:判断如何删除这项目
      const index=this.indexArray(this.formatVal,item)
      const list = this.formatVal.filter((val,i) => i!==index)
      this.formatVal = list
    },
    //handle functions
    handleBlur(e) {
      //TODO:感觉这切换的逻辑有问题
      this.isHandle = false
      //失去焦点就计算formatVal
      if (!!this.inputVal) {
        const reg = /(,|，)/
        let inputList = this.inputVal.split(reg)
        inputList = inputList.filter((item) => !reg.test(item))
        this.lockInputVal = true
        this.formatVal = inputList.map((val) => {
          return {value: val, isHandle: true}
        })
      }
    },
    handleFocus(e) {
      //   console.log(e)
      const node = e.target.nodeName
      // console.log(e.target, node)
      //TODO:这里的点击要做严格的限制,使用大量的ref
      //   if (node !== 'DIV') return
      this.isHandle = true
      this.$nextTick(() => {
        // console.log(this.$refs.handleInput)
        this.$refs.handleInput.focus()
      })
    },
    //列表单选框选中回调
    orgTableRadioChange(index) {
      if (index > -1 && index < this.dialogData.length) {
        //选中的数据赋值
        this.selectOrgs = []
        this.selectOrgs.push(this.dialogData[index])
      }
    },
    //列表复选框有改变时触发
    orgTableSelection(selection) {
      //全选的情况特殊处理(为了与原本功能逻辑不冲突,先复制一份旧的选中数据.然后拿到全选事件中去计算)
      this.oldselectOrgs = _.cloneDeep(this.selectOrgs)
      //多选
      if (this.customDialog.selectNum != 1 && !this.isCurrentChange) {
        if (selection && selection.length > 0) {
          if (
            selection.length == 1 &&
            (!this.selectOrgs || this.selectOrgs.length == 0)
          ) {
            this.selectOrgs = selection
          } else if (
            (!this.selectOrgs || this.selectOrgs.length == 0) &&
            selection.length > 1
          ) {
            if (!this.selectOrgs) {
              this.selectOrgs = []
            }
            for (let i = selection.length - 1; i >= 0; i--) {
              this.selectOrgs.push(selection[i])
            }
          } else if (this.isCurrentChange && selection.length >= 10) {
            if (!this.selectOrgs) {
              this.selectOrgs = []
            } else {
              for (let u = this.selectOrgs.length - 1; u >= 0; u--) {
                let res = this.indexArray(selection, this.selectOrgs[u])
                if (res != -1) {
                  this.selectOrgs.splice(res, 1)
                }
              }
            }
            for (let i = 0; i < selection.length; i++) {
              this.selectOrgs.push(selection[i])
            }
          } else {
            for (let i = selection.length - 1; i >= 0; i--) {
              this.selectOrgs.push(selection[i])
              break
            }
          }
        }
      }
    },
    //复选框选中回调
    onTableSelect(rows, row) {
      this.isCurrentChange = false
      //判断点击列表数据时复选框是否勾选  selected：true不勾选，false勾选
      let selected =
        this.selectOrgs &&
        this.selectOrgs.length > 0 &&
        this.indexArray(this.selectOrgs, row) !== -1
      if (selected) {
        this.isCurrentChange = true
        let res = this.indexArray(this.selectOrgs, row)
        this.selectOrgs.splice(res, 1)
      }
    },
    //表格复选框选中全部
    selectAll(selection) {
      if (this.oldselectOrgs != null && selection.length > 0) {
        for (let x = 0; x < selection.length; x++) {
          if (this.indexArray(this.oldselectOrgs, selection[x]) === -1) {
            this.oldselectOrgs.push(selection[x])
          }
        }
        this.selectOrgs = _.cloneDeep(this.oldselectOrgs)
      } else {
        this.selectOrgs = _.cloneDeep(selection)
      }
    },
    //点击列表中某一条数据时触发的回调
    orgRowClick(row, column, event) {
      if (this.customDialog.selectNum === 1) {
        // $(event.currentTarget.children[0].children[0].children[0]).trigger(
        //   'click'
        // )
        //通过数据下标锁定
        const index = this.indexArray(this.dialogData, row)
        this.radioVal = index
        this.selectOrgs = []
        this.selectOrgs.push(row)
      } else if (this.customDialog.selectNum != 1) {
        this.isCurrentChange = false
        //判断点击列表数据时复选框是否勾选  selected：true不勾选，false勾选
        let selected =
          this.selectOrgs &&
          this.selectOrgs.length > 0 &&
          this.indexArray(this.selectOrgs, row) !== -1
        if (selected) {
          this.isCurrentChange = true
          let res = this.indexArray(this.selectOrgs, row)
          this.selectOrgs.splice(res, 1)
        }
        this.$refs.orgTable.toggleRowSelection(row)
      }
    },
    handleSizeChange: function (size) {
      this.isCurrentChange = true
      //每页下拉显示数据
      this.pagination.pageSize = size
      this.search()
    },
    handleCurrentChange: function (currentPage) {
      //   const this_ = this
      //   if (this.selectOrgs != radioVal && this.selectOrgs.length > 0) {
      //     this.selectOrgs.forEach((row) => {
      //       let res = this_.indexArray(this_.checkBoxDataAll, row)
      //       if (res == -1) {
      //         this_.checkBoxDataAll.push(row)
      //       }
      //     })
      //   }
      this.isCurrentChange = true
      //点击第几页
      this.pagination.page = currentPage
      this.search()
    },
  },
}
</script>
<style lang="scss" scoped>
/** 2021-09-01  ccwgq  input里能够被若干个span撑开 */
.inputs {
  position: relative;
}
/deep/ .el-button--mini {
  padding: 0px 15px;
  font-size: 12px;
  border-radius: 3px;
  height: 100%;
  border-top-left-radius: 0;
  border-bottom-left-radius: 0;
}
/deep/ .el-button--info {
  background-color: #f5f7fa;
  border-color: #e4e7ed;
  color: #c0c4cc;
}
/deep/ .el-input__suffix {
  position: absolute;
  height: 100%;
  right: 0px !important;
  top: 0;
  text-align: center;
  color: #c0c4cc;
  -webkit-transition: all 0.3s;
  transition: all 0.3s;
  pointer-events: none;
  color: #fff;
}
.el-input__inner[aria-invalid='true'] {
  border-color: #f56c6c;
}

.el-select__tags {
  // background: #fff;
  margin-left: 1px;
  width: fit-content !important;
}

.left-aside {
  border-right: 1px solid #eee;
  padding: 10px;
}

.org-tree {
  height: 440px;
  margin-top: 10px;
}

.middle-header {
  height: unset !important;
  display: flex;
  flex-direction: row;
  flex-wrap: wrap;
  .search-item {
    display: flex;
    // width: 33.33%;
    margin-right: 12px;
  }
  .btn-wrap {
    line-height: 50px;
  }
}

.org-table {
  width: 100%;
}
/deep/ .el-table__header-wrapper{
  thead{
    tr{
      display: table-row !important;
    }
  }
}

.right-aside {
  border-left: 1px solid #eee;
}

.select-aside {
  border-left: 1px solid #eee;
}

.select-header {
  border-bottom: 1px solid #eee;
  height: 52px !important;
}

.select-header > span {
  padding: 10px 0;
  line-height: 53px;
}
.select-tree-div {
  height: calc(100% - 60px);
  overflow-y: auto;
  min-height: unset;
}
/deep/ .el-dialog__body {
  padding: 0;
  height: calc(100% - 120px);
  overflow-y: auto;
}

>>> .el-card__header {
  padding: 10px;
}

>>> .el-card__body {
  padding: 10px;
}

.org-find-card >>> .el-card__header {
  background: #f5f7fa;
}

>>> .el-main {
  padding: 0 20px !important;
}

.button-group {
  width: 70px;
  height: 170px;
  margin: 0px auto;
  position: relative;
  top: 50%;
  -webkit-transform: translateY(-50%);
  -moz-transform: translateY(-50%);
  -ms-transform: translateY(-50%);
  -o-transform: translateY(-50%);
  transform: translateY(-50%);
}

.button-group > button {
  display: block;
  margin: 8px 0;
}
@media (max-width: 1280px) {
  /deep/ .el-dialog {
    width: 96% !important;
    margin-top: 2vh !important;
  }
}
/deep/.el-dialog__wrapper {
  overflow: unset !important;
  &::-webkit-scrollbar {
    width: 0;
    background-color: transparent;
  }
}

/deep/ .el-dialog {
  height: 90%;
  min-height: 400px;
}
@media (max-height: 960px) {
  /deep/ .el-dialog__body .el-container {
    height: 100% !important;
  }
}
/deep/ .el-divider--vertical {
  height: 100%;
}
.spanLink {
  color: #409eff;
  cursor: pointer;
  &:hover {
    text-decoration: underline;
  }
}
/deep/ .el-dialog__header {
  * {
    font-size: 16px;
  }
}
/deep/ .el-dialog__body {
  * {
    font-size: 11pt;
  }
}
</style>

<style>
.title-tooltip {
  font-size: 11pt !important;
  max-width: 35%;
  margin-top: 40px;
}
