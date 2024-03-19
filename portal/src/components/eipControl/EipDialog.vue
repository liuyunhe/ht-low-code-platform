<template>
  <div class="inputs">
    <el-tooltip
      :placement="tooltipplacement || $tooltipplacement || 'top'"
      :disabled="inputWriteable && !errors.has('custom-form.' + inputName)"
    >
      <div slot="content">{{ errors.first('custom-form.' + inputName) }}</div>
      <div v-if="inputWriteable" style="width: 100%">
        <span
          class="el-select__tags"
          ref="tagSpans"
          :style="{
            width: 'calc(100% - ' + inputSuffixWidth + 'px)' + '!important',
          }"
          v-show="!input_"
        >
          <span v-if="useLink" style="width: fit-content">
            <span
              class="el-tag el-tag--info el-tag--small"
              @click.stop
              v-for="(item, index) in linkList"
              :key="item.value"
              style="margin-right: 8px"
            >
              <span
                class="el-select__tags-text relative-link"
                @click="handleLinkClick(item)"
                >{{ item.label }}</span
              >
              <i
                v-if="itemRemovable(item, saveHistory)"
                class="el-tag__close el-icon-close"
                @click="removeSelectOrg(index)"
              ></i>
            </span>
          </span>
          <span v-else style="width: fit-content">
            <span
              class="el-tag el-tag--info el-tag--small"
              @click.stop
              v-for="(item, index) in inputVal"
              :key="index"
              style="margin-right: 8px"
            >
              <span class="el-select__tags-text">{{ item.value }}</span>
              <i
                v-if="itemRemovable(item, saveHistory)"
                class="el-tag__close el-icon-close"
                @click="removeSelectOrg(index)"
              ></i>
            </span>
          </span>
        </span>
        <div
          class="el-input el-input--suffix"
          :style="{}"
        >
          <!--          input在对话框选中后禁用-->
          <input
            :disabled="inputVal instanceof Array"
            ref="inputEl"
            type="text"
            v-validate="inputValidate"
            v-model="inputVal"
            :name="inputName"
            autocomplete="off"
            class="el-input__inner"
            :placeholder="placeholderBo"
            :style="{
              color: input_ ? '' : '#fff',
              height: inputSuffixHeight +'px'
            }"
            :readonly="
              custdialog.inputReadonly != null &&
              typeof custdialog.inputReadonly == 'boolean'
                ? custdialog.inputReadonly
                : true
            "
          />
          <div ref="inputSuffix" class="el-input__suffix">
            <span class="el-input__suffix-inner">
              <el-button
                slot="append"
                type="info"
                size="mini"
                @click="showDialog"
              >
                <i
                  :class="
                    this.custdialog.icon
                      ? 'el-input__icon ' + this.custdialog.icon
                      : 'el-input__icon icon-department'
                  "
                  :style="{
                    fontSize: '17px',
                    lineHeight: inputSuffixHeight + 'px',
                  }"
                ></i>
                {{ custdialog.name }}
              </el-button>
            </span>
          </div>
        </div>
      </div>
    </el-tooltip>
    <span v-if="!inputWriteable">
      <span v-if="useLink">
        <span
          class="el-tag el-tag--info el-tag--small"
          style="margin-right: 8px"
          @click.stop
          v-for="item in linkList"
          :key="item.value"
        >
          <span
            class="el-select__tags-text relative-link"
            @click="handleLinkClick(item)"
            >{{ item.label }}</span
          >
        </span>
      </span>
      <span v-else>
        <span
          class="el-tag el-tag--info el-tag--small"
          style="margin-right: 8px"
          @click.stop
          v-for="item in inputVal"
          :key="item.value"
        >
          <span class="el-select__tags-text">{{ item.value }}</span>
        </span>
      </span>
    </span>
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
          <span style="font-size: 16px; marin-right: 15px">
            {{ selfTitle || customDialog.name }}
          </span>
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
        <!-- 组合对话框树 -->
        <el-aside
          v-if="customDialog.style == 2"
          style="width: 23%"
          v-show="treeShow"
        >
          <el-card>
            <div slot="header" class="clearfix">
              <span style="font-size: 16px">{{ leftTreeTitle }}</span>
            </div>
            <el-tree
              ref="combinationTree"
              :data="combinationTreeData"
              :props="defaultProps"
              :node-key="nodeKey"
              highlight-current
              @node-click="combiTreeClick"
              :check-on-click-node="true"
              lazy
              :load="loadTree"
            ></el-tree>
          </el-card>
        </el-aside>
        <el-divider
          direction="vertical"
          v-if="customDialog.style == 2"
        ></el-divider>
        <el-container>
          <el-header class="middle-header" v-if="querysShow">
            <div
              v-for="(condition, index) in conditionBind"
              :key="index"
              class="search-item"
            >
              <p style="font-size: 14px">{{ condition.comment }}:</p>
              <div v-if="condition.controllerType == '1'">
                <el-input
                  size="small"
                  style="width: 180px; padding: 10px 0; margin: 0 5px 0 5px"
                  clearable
                  :placeholder="placeholders[index]"
                  prefix-icon="el-icon-search"
                  v-model="queryParams[condition.field]"
                  @keyup.enter.native="searchEnterFun"
                ></el-input>
              </div>
              <div
                v-if="condition.controllerType == '2'"
                style="margin-right: 10px"
              >
                <el-radio
                  v-model="queryParams[condition.field]"
                  :label="itemR.key"
                  v-for="(itemR, $index1) in condition.config.options"
                  :key="$index1"
                  >{{ itemR.value }}</el-radio
                >
              </div>
              <div
                v-if="condition.controllerType == '3'"
                style="margin: 0px 5px; padding: 10px 0px"
              >
                <ht-select
                  v-if="condition.config.choiceType == 'static'"
                  :placeholder="quickSearch"
                  v-model="queryParams[condition.field]"
                  :options="condition.config.options"
                ></ht-select>
                <eip-select-dia
                  v-else
                  v-model="queryParams[condition.field]"
                  :placeholder="quickSearch"
                  :ganged="{
                    alias: condition.config.customQuery.alias,
                    valueBind: condition.config.customQuery.valueBind,
                    noInit: '',
                    labelBind: condition.config.customQuery.labelBind,
                    gangedBind: '{}',
                    bind: condition.config.bind,
                  }"
                  :multiple="false"
                  :filterable="false"
                  :allowCreate="false"
                  :selectlist="[]"
                  :queryParams="queryParams"
                ></eip-select-dia>
              </div>
              <div
                v-if="condition.controllerType == '4'"
                style="margin-right: 10px"
              >
                <eip-tag
                  :tag-key="condition.config.tag"
                  :placeholder="quickSearch"
                  v-model="queryParams[condition.field]"
                  :filterable="condition.config.filterable"
                  :expand="condition.config.expand"
                ></eip-tag>
              </div>
            </div>
            <div class="btn-wrap">
              <el-button
                style="margin-left: 20px"
                size="small"
                type="primary"
                icon="el-icon-search"
                @click="search(true)"
                >查询</el-button
              >
              <el-button size="small" icon="el-icon-refresh" @click="reset"
                >重置</el-button
              >
            </div>
          </el-header>
          <el-main style="padding: 0; height: 100%">
            <el-table
              :data="dialogData"
              ref="orgTable"
              height="100%"
              stripe
              border
              @row-click="orgRowClick"
              @selection-change="orgTableSelection"
              @select="onTableSelect"
              @select-all="selectAll"
              class="org-table"
              size="medium"
              style="width: 100%"
              :header-cell-style="{'text-align': 'center'}"
            >
              <el-table-column
                type="selection"
                align="center"
                width="45"
                v-if="this.customDialog.selectNum != 1"
                :selectable="dataAllowClick"
              ></el-table-column>
              <el-table-column
                align="center"
                width="50"
                v-if="this.customDialog.selectNum === 1"
              >
                <template slot-scope="scope">
                  <el-radio
                    @selection-change="orgTableSelection"
                    :label="scope.$index"
                    v-model="radioval"
                    class="textRadio"
                    >&nbsp;</el-radio
                  >
                </template>
              </el-table-column>
              <!-- <el-table-column
                type="index"
                width="50"
                align="center"
                label="序号"
              ></el-table-column>-->
              <!-- ccwgq 2022-07-04 序号按照总数据排序 -->
              <el-table-column
                type="index"
                width="65"
                align="center"
                label="序号"
              >
                <template slot-scope="scope">
                  <span>
                    {{
                      (pagination.page - 1) * pagination.pageSize +
                      scope.$index +
                      1
                    }}
                  </span>
                </template>
              </el-table-column>
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

    <!-- 树形对话框 -->
    <el-dialog
      title="动态传入参数查询"
      width="500px"
      :visible.sync="dialogVisible"
      :before-close="handleClose"
      :close-on-click-modal="false"
      top="6vh"
    >
      <!-- 动态传入参数查询树 -->
      <table
        class="form-table"
        style="margin-left: 20px; width: 90%"
        cellspacing="0"
        cellpadding="0"
        border="0"
      >
        <tbody v-for="(item, $index) in conditionfieldTree" :key="$index">
          <tr v-if="item.defaultType == '4'">
            <th width="130px">{{ item.comment }}:</th>
            <td>
              <ht-input
                type="text"
                v-if="item.type != 'date'"
                v-model="item.paramVal"
                style="width: 100%"
                :placeholder="'请输入' + item.comment"
                autocomplete="off"
              ></ht-input>
              <ht-date
                v-if="item.type == 'date'"
                v-model="item.paramVal"
                style="width: 100%"
                :placeholder="'请输入' + item.comment"
                format="yyyy-MM-dd"
              ></ht-date>
            </td>
          </tr>
        </tbody>
      </table>
      <div slot="footer" class="dialog-footer">
        <el-button type="primary" @click="handleSave">确 定</el-button>
        <el-button @click="handleClose">取 消</el-button>
      </div>
    </el-dialog>
    <el-dialog
      :visible.sync="customDialogShowTree"
      :close-on-click-modal="false"
      :before-close="dialogCancelTree"
      append-to-body
      top="6vh"
      width="500px"
    >
      <template slot="title">
        <div>
          <span style="font-size: 16px; marin-right: 15px">
            {{ selfTitle || customDialog.name }}
          </span>
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
        <el-tree
          ref="tree"
          :data="props1"
          :props="defaultProps"
          :node-key="nodeKey"
          highlight-current
          @node-click="treeClick"
          @check-change="getChecked"
          :show-checkbox="this.customDialog.selectNum === -1"
          :check-on-click-node="true"
          :check-strictly="false"
          lazy
          :load="loadTree"
          :default-expand-all="defaultExpandVal"
        ></el-tree>
      </el-container>
      <span slot="footer" class="dialog-footer" style="text-align: center">
        <el-button size="small" type="primary" @click="dialogTreeConfirm"
          >确认</el-button
        >
        <el-button size="small" @click="dialogCancelTree">取 消</el-button>
      </span>
    </el-dialog>
    <span style="display: none" v-validate>
      <slot name="labeldesc">{{ inputName }}</slot>
    </span>
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
import {cloneDeep, debounce, union} from 'lodash'
import {Base64} from 'js-base64'
export default {
  components: {EipTag, EipSelectDia},
  name: 'eip-dialog',
  props: [
    'validate',
    'value',
    'name',
    'permission',
    'atter',
    'selfPath',
    'single',
    'selectorconfig',
    'custdialog',
    'placeholder',
    'tooltipplacement',
    'expandAll', //如果是树形对话框就展开所有的树形节点
    'openDialogNotes',
    'dialogNotesContent',
    'useLink', //使用链接,默认为空
    'selfTitle', //自定义标题
    'openHistory',
    'uniqueValue',
    'useScript',
    'historyScript',
  ],
  mixins: [sub_pio_mixin], //混入方式引入表单组件中公共属性，处理子表、孙表行内联动（切面修改permission_sub）
  data() {
    return {
      dialogVisible: false, //打开树形输入动态参数值的对话框
      pageParam: {}, //树形对话框参数
      conditionfieldTree: [], //树形对话框条件字段
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
      style: 'height:440px', //对话框宽高
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
      defaultProps: {
        children: 'children',
        label: 'label',
        isLeaf: 'isLeaf',
      },
      propsData: [],
      querysShow: false, //是否显示搜索框
      radioval: '',
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
      oldselectOrgs: [],
      combinationTreeData: [],
      combiTreeDisplayField: [],
      combinationTreeQuerys: [],
      combinationRule: {},
      toggleBtn: 'el-icon-arrow-left',
      treeShow: true,
      transtionWidth: '25%',
      leftTreeTitle: '',
      writeable: true,
      input_: false,
      linkValue: '',
      saveHistory: false,
      historyFieldValue: '', //唯一字段的表单值
      oldValue: '', // 记录旧值
      oldLinkList: [], //记录链接的旧值
      historyList: [], //旧值对应的list记录
      oldMapData: [], //记录对话框所有的返回值
      valueMapList: [], //记录唯一标识字段的值
    }
  },
  computed: {
    //default expandAll false
    //TODO:移除这里的逻辑,树形默认展开移除
    defaultExpandVal() {
      if (this.expandAll == '' || this.expandAll == undefined) {
        return true
      }
      if (this.expandAll == 'true') {
        return true
      } else if (this.expandAll == 'false') {
        return false
      } else {
        return false
      }
    },
    // pagination: state => state.dialog.pagination,
    ...mapState({
      total: (state) => state.dialog.total,
      dialogData: (state) => state.dialog.rows,
    }),
    //  2021-09-01  ccwgq,对话框可选可输入
    //对于inputVal, 原来的function实际就是get()
    inputVal: {
      get() {
        //2021-11-18  ccwgq 对话框用来展示,分割的值，不指定具体的对话框
        if (
          !this.custdialog.custDialog.hasOwnProperty('alias') &&
          this.value.split(',').length > 0 &&
          this.value.length > 0
        ) {
          return this.value.split(',').map((item) => {
            return {value: item}
          })
        }
        if (!this.value || this.value === '||[]') {
          this.checkBoxDataAll = []
          // this.showData = [];
          return null
        } else {
          if (this.input_) return this.value
          let nameAry = this.value.split(',')

          if (this.value.indexOf('||') > 0) {
            nameAry = this.value.split('||')[0].split(',')
            // this.showData=JSON.parse(this.value.split("||")[1]);
          }
          //  this.showData =this.selectOrgs;
          let idAry = null
          let accountAry = null
          let result = []
          if (nameAry.length > 0) {
            nameAry.forEach((m, i) => {
              let n = {value: m}
              result.push(n)
            })
          } else {
            return this.value
          }

          return result
        }
      },
      set(val) {
        if (!this.input_) this.input_ = true
        this.selectOrgs = [...this.showData]
        this.checkBoxDataAll = [...this.selectOrgs]
        this.$emit('input', val)
      },
    },
    inputWriteable: function () {
      // return false;
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
    // 是否有回填设置
    bindSet: function () {
      return this.selectorconfig ? this.selectorconfig.bind : null
    },
    // 20211118 ccwgq 判断是否存在别名  展示使用 对话框可能仅仅作为一个显示效果,
    //TODO:抽取这功能为multi-tag 组件
    onlyShow() {
      return !this.custdialog.custDialog.hasOwnProperty('alias')
    },
    //链接存放的字段
    linkField() {
      if (!this.useLink) return ''
      const obj = this.custdialog.customLink
      return obj.linkFieldPath
    },
    linkList() {
      if (this.useLink) {
        var tmp = ''
        try {
          tmp = JSON.parse(this.linkValue)
        } catch {
          tmp = []
        }
        return tmp
      }
      return null
    },
    historyFieldList() {
      if (!this.historyFieldValue) return []
      let val = this.historyFieldValue.split(',')
      if (val.length == 1) {
        val[0] = val[0].toString()
      }
      return val
    },
  },
  watch: {
    props1: function (newVal, oldVal) {
      //树形
      if (this.showData != undefined && this.showData.length > 0) {
        const this_ = this
        let data = []
        for (let i = 0; i < this.showData.length; i++) {
          data.push(this.showData[i])
        }
        setTimeout(() => {
          for (let i = 0; i < data.length; i++) {
            this_.$refs.tree.setChecked(data[i], true)
            this_.checkNode(data[i], this_)
          }
        }, 200)
      }
    },
    //ninghua 20221021 修复按钮遮挡
    value: {
      handler: function (val) {
        this.$nextTick(() => {
          this.calacInputSuffixWidth()
          // this.autoHeight()
        })
      },
    },
    permission(val){
      if(val == 'w'){
        this.$nextTick(()=>{
           this.calacInputSuffixHeight()
        })
      }
    },
    //ccwgq 2022-04-20 修复禅道BUG77
    customDialogShowList: function (val) {
      this.$nextTick(() => {
        // this.oldselectOrgs = []
        // this.selectOrgs = []
      })
    },
    dialogVisible: function (val) {
      this.$nextTick(() => {
        // this.oldselectOrgs = []
        // this.selectOrgs = []
      })
    },
    customDialogShowTree: function (val) {
      this.$nextTick(() => {
        // this.oldselectOrgs = []
        // this.selectOrgs = []
      })
    },
    dialogData: {
      handler: function (val) {
        const that = this
        if (val.length) {
          if (that.saveHistory) {
            let historyVal = that.historyFieldValue || ''
            historyVal = historyVal.toString()
            const list = historyVal.split(',')
            const field = that.custdialog.uniqueField.field
            this.historyList = val.filter((item) => {
              return list.includes(item[field ?? ''] ?? '')
            })
            this.$nextTick(() => {
              val.forEach((s, index) => {
                if (list.includes(s[field])) {
                  this.$refs.orgTable.toggleRowSelection(val[index], true)
                }
              })
            })
          }
        }
      },
      immediate: true,
    },
  },
  created() {
    this.saveHistory = this.openHistory
    if (!this.placeholder) {
      this.placeholderBo = '请选择内容'
    } else {
      this.placeholderBo = this.placeholder
    }
    this.$validator = this.$root.$validator
  },
  mounted() {
    const {subScopeEl, index: subIndex} = hotentUiUtils.getSubScopeElAndIndex(
      this.$el
    )
    const {index: sunIndex} = hotentUiUtils.getSunScopeElAndIndex(this.$el)
    if (this.useLink) {
      this.getLinkValue(subIndex, sunIndex)
    }
    if (
      subScopeEl &&
      (subScopeEl.getAttribute('row_readonly') == 'true' ||
        subScopeEl.getAttribute('row_readonly') === true)
    ) {
      this.writeable = false
    }
    //获取对话框按钮名称宽度
    // if (this.$refs.inputSuffix) {
    //   this.inputSuffixWidth = this.$refs.inputSuffix.offsetWidth + 1
    // }
    //执行自定义的JS脚本
    if (this.openHistory && this.useScript && this.historyScript) {
      this.customScript()
    }

    this.$nextTick(() => {
      if (this.saveHistory) {
        this.computeUniqueFieldValue()
        var tmp = ''
        try {
          tmp = JSON.parse(this.linkValue)
        } catch {
          tmp = []
        }
        this.oldLinkList = tmp
        this.oldValue = this.value
        this.oldMapData = this.getAllMapValue(this.selfPath)
      }
    })
    //ninghua  20221021 修复按钮遮挡
    this.$nextTick(() => {
      this.calacInputSuffixWidth();
      this.calacInputSuffixHeight();
    })
  },
  methods: {
    //ccwgq 2022-10-19 自定义的JS脚本
    customScript() {
      const formVm = utils.getOnlineFormInstance(this)
      const scriptCode = Base64.decode(this.historyScript)
      const _this = this
      function evil() {
        let Fn = Function('req', 'data', 'formVm', '_this', scriptCode) //一个变量指向Function，防止有些前端编译工具报错
        let result = Fn(req, formVm.data, formVm, _this)
        return result
      }
      let resultValue = evil()
      if (resultValue !== undefined) {
        this.saveHistory = resultValue
      }
    },
    //ccwgq 2022-10-19 获得所有历史的数据
    getAllMapValue(excludePath) {
      excludePath = excludePath || ''
      const mappingConf = this.custdialog.custDialog.mappingConf
      if (mappingConf?.length ?? 0) {
        const {index: subIndex} = hotentUiUtils.getSubScopeElAndIndex(this.$el)
        const {index: sunIndex} = hotentUiUtils.getSunScopeElAndIndex(this.$el)
        const vm = utils.getOnlineFormInstance(this)
        const map = []
        mappingConf.forEach((conf) => {
          if (conf.target?.[0]) {
            let excludeName = excludePath.split('.')
            let targetName = conf.target[0].split('.')
            if (this.excludePath) {
              targetName = targetName[targetName.length - 1]
              excludeName = excludeName[excludeName.length - 1]
            }
            excludeName = excludeName.toString()
            targetName = targetName.toString()
            if (excludeName !== targetName) {
              const val = utils.getValueByPath(
                vm,
                'data.' + conf.target[0],
                subIndex,
                sunIndex
              )
              map.push({
                path: conf.target[0],
                value: val,
              })
            }
          }
        })
        return map
      }
    },
    //ccwgq 2022-10-15 计算 唯一标识字段的值
    computeUniqueFieldValue() {
      const uniqueField = this.custdialog.uniqueField
      const path = uniqueField?.target ?? ''
      if (path) {
        let {index: subIndex} = hotentUiUtils.getSubScopeElAndIndex(this.$el)
        let {index: sunIndex} = hotentUiUtils.getSunScopeElAndIndex(this.$el)
        const vm = utils.getOnlineFormInstance(this)
        this.historyFieldValue = utils.getValueByPath(
          vm,
          'data.' + path,
          subIndex,
          sunIndex
        )
        if (this.historyFieldValue) {
          this.historyFieldValue = this.historyFieldValue.toString()
        }
        return this.historyFieldValue
      }
      return null
    },
    selectAll(selection) {
      if (this.oldselectOrgs != null && selection.length > 0) {
        for (let x = 0; x < selection.length; x++) {
          if (this.indexArray(this.oldselectOrgs, selection[x]) === -1) {
            this.oldselectOrgs.push(selection[x])
          }
        }
        this.selectOrgs = cloneDeep(this.oldselectOrgs)
      } else {
        this.selectOrgs = cloneDeep(selection)
      }
    },
    //ccwgq 2022-10-13 多选表格数据允许勾选
    dataAllowClick(row) {
      if (this.saveHistory) {
        let uniqueValue = this.historyFieldValue || ''
        uniqueValue = uniqueValue.toString()
        let list = uniqueValue.split(',') || []
        list = list.map((item) => item.toString())
        const field = this.custdialog.uniqueField.field
        const val = row[field ?? ''] ?? ''
        return !list.includes(val)
      }
      return true
    },
    //判断是否可删除
    itemRemovable(item, saveData) {
      // console.log(item)
      if (saveData) {
        const list = this.oldLinkList.map((data) => JSON.stringify(data))
        return !list.includes(JSON.stringify(item))
      } else {
        return true
      }
    },
    checkNode(data, this_, pnode) {
      if (data.Pid) {
        let node = this_.$refs.tree.getNode(data.Pid)
        node.indeterminate = true
        if (node.data.Pid) {
          this_.$refs.tree.getNode(node.data.Pid).indeterminate = true
          this.checkNode(
            this_.$refs.tree.getNode(node.data.Pid).data,
            this_,
            this_.$refs.tree.getNode(node.data.Pid)
          )
        }
        if (!node.indeterminate) {
          node.indeterminate = true
        }
      } else if (pnode && !pnode.indeterminate) {
        pnode.indeterminate = true
      }
    },
    //回车查询
    searchEnterFun: function (e) {
      var keyCode = window.event ? e.keyCode : e.which
      if (keyCode == 13) {
        this.search()
      }
    },
    handleSizeChange: function (size) {
      this.isCurrentChange = true
      //每页下拉显示数据
      this.pagination.pageSize = size
      this.search()
    },
    handleCurrentChange: function (currentPage) {
      const this_ = this
      if (this.selectOrgs != undefined && this.selectOrgs.length > 0) {
        this.selectOrgs.forEach((row) => {
          let res = this_.indexArray(this_.checkBoxDataAll, row)
          if (res == -1) {
            this_.checkBoxDataAll.push(row)
          }
        })
      }
      this.isCurrentChange = true
      //点击第几页
      this.pagination.page = currentPage
      this.search()
    },
    checkList() {
      const this_ = this
      setTimeout(() => {
        //列表
        if (
          this_.checkBoxDataAll != undefined &&
          this_.checkBoxDataAll.length > 0
        ) {
          this_.checkBoxDataAll.forEach((row) => {
            let res = this_.indexArray(this_.dialogData, row)
            this_.radioval = res
            if (res != -1) {
              this_.isCurrentChange = true
              this_.toggleRowSelection(res, true)
            }
          })
        }
      }, 300)
    },
    toggleRowSelection(res, val) {
      // console.log(this);
      // console.log(this.$refs.orgTable);
      this.$refs.orgTable.toggleRowSelection(this.dialogData[res], val)
    },
    showDialog(item) {
      const this_ = this
      var alias = this.custdialog.custDialog.alias
      //如果showData有数据，直接给selectOrgs赋值
      if (this.showData?.length ?? 0) {
        this.selectOrgs = this.showData
      } else {
        this.selectOrgs = []
      }
      this.$store.dispatch('form/getByAlias', alias).then((customDialog) => {
        if (!customDialog || !customDialog.alias) {
          Message.error('对话框别名【' + alias + '】不存在！')
          return
        }
        if (customDialog.style == 1) {
          var displaylist = JSON.parse(customDialog.displayfield)
          this_.nodeKey = displaylist.id
        }
        //对话框按表单字段查询（参数传入的）
        let bindList = this_.custdialog.custDialog.conditions
        this_.param = [] //绑定的表单字段
        if (bindList.length > 0) {
          bindList.forEach((ele) => {
            //绑定表单字段
            if (ele.defaultType == '3' && ele.bind) {
              let obj = {}
              obj.field = ele.field
              obj.bind = ele.bind
              this_.param.push(obj)
            }
          })
        }
        //判断对话框查询是否有条件
        let userInputList = JSON.parse(customDialog.conditionfield)
        this_.quickSearch = '' //填写提示 placeholder
        this_.conditionBind = []
        let queryParams = []
        let placeholders = []
        if (userInputList.length > 0) {
          userInputList.forEach((ele) => {
            var obj = {}
            //条件查询参数（用户输入的） 文本框输入
            if (ele.defaultType == '1') {
              obj[ele.field] = ''
              queryParams.push(obj)
              this_.conditionBind.push(ele)
              placeholders.push('请输入' + ele.comment)
            }
          })
          this.$set(this, 'queryParams', queryParams)
          this.$set(this, 'placeholders', placeholders)
        }
        //判断是否显示条件查询输入框
        if (this_.quickSearch != '') {
          this_.querysShow = true
        } else {
          this_.querysShow = true
        }
        this_.quickSearch = '请输入' + this.quickSearch + '查询'
        this_.style = 'height:' + customDialog.height + 'px'
        if (window.screen.height && window.screen.height <= 900) {
          this.style = 'height:440px'
        }
        if (customDialog.style == 0 || customDialog.style == 2) {
          //列表
          this_.customDialogShow({alias: alias, customDialog: customDialog})
        } else if (customDialog.style == 1) {
          //树形
          this_.pageParam = {alias: alias, customDialog: customDialog}
          this_.customDialog = customDialog
          let param = {}
          this_.conditionfieldTree = []
          //判断是否存在条件
          if (customDialog.conditionfield) {
            this_.conditionfieldTree = JSON.parse(customDialog.conditionfield)
            if (this_.conditionfieldTree.length > 0) {
              for (let i = this_.conditionfieldTree.length - 1; i >= 0; i--) {
                //判断条件字段是否是动态传入（defaultType：4：动态传入，2：固定值 ）
                if (this_.conditionfieldTree[i].defaultType == '4') {
                  param[this_.conditionfieldTree[i].field] =
                    this_.conditionfieldTree[i].comment
                }
              }
            }
          }
          //有动态传入的字段
          if (JSON.stringify(param) != '{}') {
            this_.dialogVisible = true
          } else {
            //无动态传入的字段
            this_.customDialogTreeShow(this_.pageParam)
          }
        }
      })
    },
    //ccwgq 2022-10-13 保存历史的值

    //打开树形动态参数输入值的对话框
    handleSave() {
      this.customDialogTreeShow(this.pageParam)
      this.dialogVisible = false
    },
    //关闭树形动态参数输入值的对话框
    handleClose() {
      this.dialogVisible = false
    },
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
    //求多个数组的并集
    unionArray(arr, ...args) {
      let nArr = cloneDeep(arr)
      while (args.length) {
        const obj = args.shift()
        if (obj && obj.length) {
          nArr.push(obj)
        }
      }
      if (nArr?.flat) {
        nArr = nArr.flat()
      }
      const map = {}
      const field = this.custdialog.uniqueField.field
      nArr.forEach((item) => {
        map[item[field]] = item
      })
      return Object.values(map)
    },
    //点击列表某一个复选框时触发
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
    //点击列表某一条数据时触发
    orgRowClick(row, column, event) {
      if (this.saveHistory && !this.dataAllowClick(row)) {
        return
      }
      if (this.customDialog.selectNum === 1) {
        $(event.currentTarget.children[0].children[0].children[0]).trigger(
          'click'
        )
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

    //ninghua 20221021 拿到按钮宽度改变
    calacInputSuffixWidth() {
      const that = this
      setTimeout(() => {
        const el = that.$refs?.['inputSuffix'] ?? null
        that.inputSuffixWidth = el?.offsetWidth ?? 123
      }, 0)
    },
    //20221021  ninghua   会签时相关公文高度自适应
    // autoHeight(){
    //   const that= this;
    //   setTimeout(()=>{
    //     const el = that.$refs?.['tagSpans'] ?? null
    //     that.inputSuffixHeight = el?.offsetHeight ?? 33
    //   },0)
    // },
    dialogConfirm() {
      this.queryParam = ''
      this.customDialogShowList = false
      this.input_ = false
      this.calacInputSuffixHeight()
      //  ccwgq
      if (!this.onlyShow) {
        this.syncInputValue()
        if (this.$refs.inputSuffix) {
          this.inputSuffixWidth = this.$refs.inputSuffix.offsetWidth + 1
        }
      }
      // console.log(this.$refs.inputEl.value);
      this.$store.dispatch('dialog/setDialogData', [])
    },
    //重置
    reset() {
      this.queryParams.forEach((paramObj) => {
        for (let key in paramObj) {
          this.queryParams[key] = ''
        }
      })
      //组合树重置
      if (this.$refs.combinationTree && this.$refs.combinationTree.store) {
        let nodes = this.$refs.combinationTree.store.nodesMap
        for (let key in nodes) {
          nodes[key].expanded = false
        }
        this.combinationTreeQuerys.splice(0)
      }
      this.search(true)
    },
    //查询
    search(resetPagintion) {
      let querys = [] //查询条件
      let queryFilter = {}
      if (JSON.stringify(this.pagination) == '{}') {
        this.pagination = {page: '1', pageSize: '10', showTotal: 'true'}
      }
      let pageBean = {pageBean: this.pagination}
      if (resetPagintion) {
        pageBean.pageBean = {page: '1', pageSize: '10', showTotal: 'true'}
      }
      //用户输入的
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
    // 处理POST请求时的参数
    handlePostData(queryFilter) {
      if (
        !this.customDialog.dataParam ||
        this.customDialog.dataParam.constructor != String
      ) {
        return queryFilter
      }
      // 构建上下文数据对象
      let ctx = {}
      queryFilter &&
        queryFilter.querys.forEach((element) => {
          ctx[element.property] = element.value
        })
      const exp = hotentUiUtils.parseExp(this.customDialog.dataParam, ctx)
      try {
        return JSON.parse(exp)
      } catch (e) {
        CustomQuery._throwException(
          `POST参数不是有效的JSON格式${query.dataParam}`
        )
      }
    },
    async doQuery(param) {
      let paramLoadData = []
      const pInst = utils.getOnlineFormInstance(this)
      //获取关联查询绑定的表单参数
      for (let i = 0; i < param.conditionfield.length; i++) {
        if (param.conditionfield[i].fieldPath != '') {
          let bindVal = utils.getValueByPath(
            pInst,
            param.conditionfield[i].fieldPath,
            null
          )
          let obj = {key: param.conditionfield[i].field, value: bindVal}
          paramLoadData.push(obj)
        }
      }

      let queryUrl =
        param.dsType == 'dataSource'
          ? '${form}/form/customQuery/v1/doQuery?alias=' +
            param.alias +
            '&page=1'
          : param.url
      let requestMethod = 'POST'
      //如果关联数据列表查询数据不是数据源则请求方法为restful配置的请求方式
      if (param.dsType != 'dataSource') {
        requestMethod = param.requestType
      }
      //查询数据
      req
        .request({url: queryUrl, method: requestMethod, data: paramLoadData})
        .then((res) => {
          //判断是否有关联查询数据返回
          if (res.data.rows.length > 0) {
            //获取关联查询返回的表单参数
            for (let io = 0; io < param.resultfield.length; io++) {
              if (param.resultfield[io].fieldPath != '') {
                let val = ''
                for (let j = 0; j < res.data.rows.length; j++) {
                  if (res.data.rows[j][param.resultfield[io].field]) {
                    val =
                      val + res.data.rows[j][param.resultfield[io].field] + ','
                  }
                }
                val = val.substring(0, val.length - 1)
                let pathArr = param.resultfield[io].fieldPath.split('.')
                if (pathArr.length == 3) {
                  //主表
                  utils.setValueByPath(
                    pInst,
                    param.resultfield[io].fieldPath,
                    val,
                    null
                  )
                } else if (pathArr.length == 4) {
                  //子表
                  let subData = pInst.data[pathArr[1]][pathArr[2]]
                  if (subData.length == 0) {
                    //子表没数据的情况
                    let subTabName = pathArr[2].replace('sub_', '')
                    //得到子表的所有字段
                    let subInitData =
                      pInst.data[pathArr[1]].initData[subTabName] || {}
                    //把数组里面的值为 null 转换为空字符串
                    let str = JSON.stringify(subInitData).replace(/null/g, '""')
                    let subData = JSON.parse(str)
                    for (var key in subData) {
                      //点添加时判断要新增子表记录中的孙表是否有值
                      if (key.indexOf('sub_') == 0 && subData[key].length > 0) {
                        subData[key] = [] //有则清空
                      }
                      //点添加时判断要新增子表记录中的字段是否有值
                      if (subData[key]) {
                        subData[key] = '' //有则清空
                      }
                    }
                    //新增一条数据
                    pInst.data[pathArr[1]][pathArr[2]].push(subData)
                    //对话框关联查询返回的值赋值给绑定的字段
                    utils.setValueByPath(
                      pInst,
                      param.resultfield[io].fieldPath,
                      val,
                      0
                    )
                  } else {
                    //子表有数据的情况
                    for (let p = 0; p < subData.length; p++) {
                      //对话框关联查询返回的值赋值给绑定的字段
                      utils.setValueByPath(
                        pInst,
                        param.resultfield[io].fieldPath,
                        val,
                        p
                      )
                    }
                  }
                }
              }
            }
          } else {
            //没有返回的值则清空
            //获取关联查询返回的表单参数
            for (let iop = 0; iop < param.resultfield.length; iop++) {
              if (param.resultfield[iop].fieldPath != '') {
                let pathArr = param.resultfield[iop].fieldPath.split('.')
                if (pathArr.length == 3) {
                  //主表
                  //赋值给绑定的字段
                  utils.setValueByPath(
                    pInst,
                    param.resultfield[iop].fieldPath,
                    '',
                    null
                  )
                } else if (pathArr.length == 4) {
                  //子表
                  let subData = pInst.data[pathArr[1]][pathArr[2]]
                  for (let p = 0; p < subData.length; p++) {
                    //对话框关联查询返回的值赋值给绑定的字段
                    utils.setValueByPath(
                      pInst,
                      param.resultfield[iop].fieldPath,
                      '',
                      p
                    )
                  }
                }
              }
            }
          }
        })
    },
    // 同步选择结果
    syncInputValue() {
      let thisIndex = null //当前数据所在下标
      let parentIndex = null //父节点所在下标
      let hasGrand = false // ccwgq ===>判断是否存在孙表
      //获取子孙的index
      const {index: subIndex} = hotentUiUtils.getSubScopeElAndIndex(this.$el)
      const {index: sunIndex} = hotentUiUtils.getSunScopeElAndIndex(this.$el)
      // if (this.$el) {
      //   thisIndex = utils.getSomeAttributeFromParentElement(
      //     this.$el,
      //     'data-index'
      //   )
      //   parentIndex = utils.getSomeAttributeFromParentElement(
      //     this.$parent.$el,
      //     'data-index'
      //   )
      // }
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
      const this_ = this
      //保证是一个array
      this.selectOrgs = this.selectOrgs === null ? [] : this.selectOrgs
      //数据去重
      if (this.saveHistory) {
        const field = this.custdialog.uniqueField.field
        this.selectOrgs = this.selectOrgs.filter((item) => {
          return !this.historyFieldList.includes(item[field ?? ''] ?? '')
        })
      }
      var s = this.selectOrgs || []
      this.showData = [...this.selectOrgs]
      this.checkBoxDataAll = [...this.selectOrgs]
      if (this.customDialog.selectNum === 1) {
        s = this.selectOrgs
      }
      if (this.customDialog.selectNum === 1) {
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
      //这时可以执行
      // this.$emit("input", JSON.stringify(str));
      const pInst = utils.getOnlineFormInstance(this)

      const _this = this
      let strMapList = null
      this.custdialog.custDialog.mappingConf.forEach((con) => {
        var val = ''
        var from = ''
        if (_this.customDialog.dsType === 'restful') {
          from = con.from
        } else {
          from = con.from.toLowerCase()
        }
        str.forEach((item) => {
          //console.log("the type of item is: ",typeof item);
          item = item || {} //item可能是undefined 导致后续报错，加上这一行完美解决
          //console.log("item===>,from===>",item,from);
          if (from in item && item[from])
            val += decodeURIComponent(item[from]) + ','
        })
        if (_this.atter === 'data.' + con['target'][0]) {
          //在这里实现链接的回填
          if (_this.useLink) {
            strMapList = str.map((item, index) => {
              if (!item) {
                return {
                  value: '',
                  data: {},
                }
              }
              return {
                value: item[from],
                data: s[index],
              }
            })
          }
          val = val.substring(0, val.length - 1)
          utils.setValueByPath(
            pInst,
            'data.' + con['target'][0],
            val,
            // thisIndex
            subIndex,
            sunIndex
          )
        } else if (_this.atter == 'searchForm.' + con['target'][0]) {
          val = val.substring(0, val.length - 1)
          utils.setValueByPath(
            pInst,
            'searchForm.' + con['target'][0],
            val,
            // thisIndex
            subIndex,
            sunIndex
          )
        } else {
          let configAttr = con['target'][0].split('.')
          let path = con['target'][0]
          // hasGrand = configAttr.length === 4 //路径存在四层判定是孙表
          // if (configAttr.length == 4 && parentIndex >= 0) {
          //   //孙表数据赋值
          //   path =
          //     configAttr[0] +
          //     '.' +
          //     configAttr[1] +
          //     '[' +
          //     parentIndex +
          //     '].' +
          //     configAttr[2] +
          //     '.' +
          //     configAttr[3]
          // }
          //ccwgq   在这里补充自己的代码，覆盖原来的路径赋值
          // let sonIndex = null
          // let grandIndex = null
          // if (hasGrand) {
          //   sonIndex = utils.getSonTableIndex(_this, configAttr, true)
          //   grandIndex = utils.getGrandTableIndex(_this, configAttr)
          //   path =
          //     configAttr[0] +
          //     '.' +
          //     configAttr[1] +
          //     '[' +
          //     sonIndex +
          //     '].' +
          //     configAttr[2] +
          //     '.' +
          //     configAttr[3]
          // }
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
                  valCopy = valCopy.substring(0, valCopy.length - 2)
                }
                this.$emit('input', valCopy)
                strMapList = str.map((item, index) => {
                  if (!item) {
                    return {
                      value: '',
                      data: {},
                    }
                  }
                  return {
                    value: item[from],
                    data: s[index],
                  }
                })
              }
            }
            val = val.substring(0, val.length - 1)
            utils.setValueByPath(pInst, 'data.' + path, val, subIndex, sunIndex)
          } else {
            val = val.substring(0, val.length - 1)
            utils.setValueByPath(
              pInst,
              'model.' + path,
              val,
              subIndex,
              sunIndex
            )
          }
        }
      })
      //判断对话框是否绑定了关联查询
      let custQueryJson = this.custdialog.custDialog.custQueryJson
      if (custQueryJson.length > 0) {
        for (let i = 0; i < custQueryJson.length; i++) {
          if (custQueryJson[i].conditionfield.length > 0) {
            this.doQuery(custQueryJson[i])
          } else {
          }
        }
      }
      //关联链接回填
      if (this.useLink) {
        this.syncRelativeLink(strMapList, pInst, subIndex, sunIndex)
      }
      //拼接历史数据
      this.$nextTick(() => {
        if (this.saveHistory) {
          if (this.oldMapData?.length ?? 0) {
            const newMapData = this.getAllMapValue(this.selfPath)
            const vm = utils.getOnlineFormInstance(this)
            if (newMapData?.length ?? 0) {
              //合并数据
              newMapData.forEach((item, index) => {
                let list = item.value.split(',')
                let val = this.oldMapData[index].value
                val = val.split(',')
                list.push(...val)
                utils.setValueByPath(
                  vm,
                  'data.' + item.path,
                  list.join(','),
                  subIndex,
                  sunIndex
                )
              })
            } else {
              oldMapData.forEach((item) => {
                utils.setValueByPath(
                  vm,
                  'data.' + item.path,
                  item.value,
                  subIndex,
                  sunIndex
                )
              })
            }
          }
          if (this.oldValue) {
            let char = ''
            if (this.value) {
              char = ','
            }
            const newVal = this.value + char + this.oldValue
            this.$emit('input', newVal)
          }
        }
      })
    },
    //ccwgq 2022-08-15补充 回填关联链接
    syncRelativeLink(map, vm, subIndex, sunIndex) {
      let linkItem = this.custdialog.customLink
      // this.custdialog.customLink.map((linkItem) => {
      let path = linkItem.linkFieldPath
      //循环模板解析
      let backVal = []
      if (map.length) {
        for (let obj of map) {
          //label解析
          const label = decodeURIComponent(obj.value)
          const item = obj.data
          let link = ''
          //使用通用模板还是根据分类使用不同的模板
          if (linkItem.useCommon) {
            link = utils.parseTemplate(item, linkItem.commonTmp)
          } else {
            for (let conf of linkItem.linkingConf) {
              if (item[conf.field.toLocaleLowerCase()] == conf.value) {
                link = utils.parseTemplate(item, conf.linkTmp)
                break
              }
            }
          }
          let rest = {}
          rest.label = !label ? link : label
          rest.link = link
          rest.platform = true

          if (this.saveHistory) {
            const uniqueField = this.custdialog.uniqueField
            const field = uniqueField.field
            rest.uniqueField = field
            rest.uniqueValue = item[field]
          }
          backVal.push(rest)
        }
      }
      if (this.saveHistory && this.oldLinkList?.length) {
        backVal.push(...this.oldLinkList)
      }
      utils.setValueByPath(
        vm,
        'data.' + path,
        JSON.stringify(backVal),
        subIndex,
        sunIndex
      )
      this.getLinkValue()
      // })
    },
    getLinkValue(subIndex, sunIndex) {
      let linkItem = this.custdialog.customLink
      let path = linkItem.linkFieldPath
      const vm = utils.getOnlineFormInstance(this)
      this.linkValue = utils.getValueByPath(
        vm,
        'data.' + path,
        subIndex,
        sunIndex
      )
      return this.linkValue
    },
    //取消按钮
    dialogCancel() {
      const this_ = this
      this_.queryParam = ''
      this_.$store.dispatch('dialog/setDialogData', []).then(() => {
        this_.customDialogShowList = false
        //判断是否是点击了确认再点击取消的  inputVal没有值则表示直接点击的取消
        if (!this_.inputVal) {
          this_.selectOrgs = []
        } else {
          this_.selectOrgs = [...this_.showData]
          this.checkBoxDataAll = [...this_.selectOrgs]
        }
      })
    },
    dialogTreeConfirm() {
      this.calacInputSuffixHeight()
      let thisIndex = null //当前数据所在下标
      let parentIndex = null //父节点所在下标
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
      this.$store.dispatch('dialog/setDialogData', [])
      var returnStr = JSON.parse(this.customDialog.resultfield)
      var field = new Array([returnStr.length])
      var comment = new Array([returnStr.length])
      var str = []
      for (var i = 0; i < returnStr.length; i++) {
        field[i] = returnStr[i].field
        comment[i] = returnStr[i].comment
      }
      if (this.customDialog.selectNum === 1) {
        var nodes = this.propsData[0]
        var temp = ''
        for (var i = 0; i < comment.length; i++) {
          temp += '"' + comment[i] + '":"' + nodes[field[i]] + '",'
        }
        if (temp != '') {
          temp = '{' + temp.substring(0, temp.length - 1) + '}'
        }
        str.push(utils.parseToJson(temp))
      } else {
        var nodes = this.propsData
        nodes.forEach((item, k) => {
          var temp = ''
          for (var i = 0; i < comment.length; i++) {
            temp += '"' + comment[i] + '":"' + nodes[field[i]] + '",'
            temp += '"' + comment[i] + '":"' + nodes[k][field[i]] + '",'
          }
          if (temp != '') {
            temp = '{' + temp.substring(0, temp.length - 1) + '}'
          }
          str.push(utils.parseToJson(temp))
        })
      }
      const pInst = utils.getOnlineFormInstance(this)
      this.custdialog.custDialog.mappingConf.forEach((con) => {
        var val = ''
        str.forEach((item) => {
          val += item[con.from] + ','
        })
        if (this.atter == 'data.' + con['target'][0]) {
          utils.setValueByPath(
            pInst,
            'data.' + con['target'][0],
            val.substring(0, val.length - 1),
            thisIndex
          )
        } else if (this.atter == 'searchForm.' + con['target'][0]) {
          utils.setValueByPath(
            pInst,
            'searchForm.' + con['target'][0],
            val.substring(0, val.length - 1),
            thisIndex
          )
        } else {
          let configAttr = con['target'][0].split('.')
          let path = con['target'][0]
          const hasGrand = configAttr.length == 4 && parentIndex >= 0
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
          if (hasGrand) {
            utils.getSonTableIndex()
          }
          if (pInst.data) {
            utils.setValueByPath(
              pInst,
              'data.' + path,
              val.substring(0, val.length - 1),
              thisIndex
            )
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
      //this.$emit("input", JSON.stringify(str));

      this.showData = [...this.propsData] //回显的值

      this.customDialogShowTree = false
      this.input_ = false
    },
    dialogCancelTree() {
      this.$store.dispatch('dialog/setDialogData', [])
      this.customDialogShowTree = false
    },
    getChecked(data, checked, indeterminate) {
      if (this.customDialog.selectNum === 1) {
        this.propsData = []
        this.propsData.push(data)
      } else {
        this.propsData = this.$refs.tree.getCheckedNodes()
      }
    },
    treeClick(data, n, i) {
      if (this.customDialog.selectNum === 1) {
        this.propsData = []
        this.propsData.push(data)
      }
    },
    clearAllSelectOrgs() {
      this.selectOrgs = null
      this.$refs.orgTable.clearSelection()
    },
    removeSelectOrg(item) {
      if (this.customDialog.selectNum === 1) {
        this.$emit('input', '')
        this.selectOrgs.splice(item, 1)
        this.showData.splice(item, 1)
      } else {
        this.inputVal.splice(item, 1)
        // let removeId = this.showData[item];
        //树形
        if (this.propsData.length > 0) {
          this.propsData.splice(item, 1)
        }
        if (this.showData.length > 0) {
          this.showData.splice(item, 1)
        }
        //列表
        if (this.selectOrgs != null) {
          //TODO:保证数组index和inputVal一致
          this.selectOrgs.splice(item, 1)
          this.checkBoxDataAll.splice(item, 1)
          this.selectOrgs.forEach((row) => {
            // if(item.id ==removeId ){
            this.isCurrentChange = true
            this.toggleRowSelection(row, false)
            // }
          })
        }

        this.calacInputSuffixHeight()
        let value = ''
        value = this.inputVal.map((item) => item.value).join(',')
        // this.inputVal.forEach((val) => {
        //   value += val.value + ','
        // })
        // if (value.length > 0) {
        //   value = value.substring(0, value.length - 1)
        // }
        if (value != '') {
          value = value + '||' + JSON.stringify(this.showData)
        }
        // this.$emit('input', value)
      }
      if (!this.selectOrgs || this.selectOrgs.length < 1) {
        this.radioval = ''
      }
      this.selectOrgs = this.showData
      if (!this.onlyShow) {
        this.syncInputValue(true)
      }
    },

    calacInputSuffixHeight() {
      let that = this
      setTimeout(() => {
        if (!that.$refs.tagSpans) return
        if (that.$refs.tagSpans.offsetHeight) {
          that.inputSuffixHeight = that.$refs.tagSpans.offsetHeight + 5
        } else {
          that.inputSuffixHeight = 30
        }
        // 触发验证
        that.$validator.validate()
      }, 0)
    },
    customDialogShow(pageParam) {
      this.customDialogShowList = true
      this.customDialog = pageParam.customDialog
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
    customDialogTreeShow(pageParam) {
      var customDialog = this.customDialog
      let mapParamObj = {} //数据来源是数据源，且有动态参数传入时调用
      let mapParam = ''
      let defaultPValue = '' //父ID值
      if (this.conditionfieldTree.length > 0) {
        for (let i = 0; i < this.conditionfieldTree.length; i++) {
          if (this.conditionfieldTree[i].defaultType == '4') {
            //动态传入
            //得到输入的条件字段值
            let val = this.conditionfieldTree[i].paramVal
            if (!val) {
              continue
            }
            //得到条件字段KEY
            let key = this.conditionfieldTree[i].field
            mapParamObj[key] = val
          } else if (this.conditionfieldTree[i].defaultType == '2') {
            //固定值
            //得到输入的条件字段值
            let val = this.conditionfieldTree[i].defaultValue
            if (!val) {
              continue
            }
            //得到条件字段KEY
            let key = this.conditionfieldTree[i].field
            mapParamObj[key] = val
          }
        }
        if (JSON.stringify(mapParamObj) != '{}') {
          //获取对话框配置的父ID字段
          let pid = JSON.parse(this.customDialog.displayfield).pid
          for (let m in mapParamObj) {
            if (pid == m) {
              defaultPValue = mapParamObj[m]
              break
            }
          }
          mapParam = JSON.stringify(mapParamObj)
          mapParam = mapParam.substring(1, mapParam.length - 1)
        }
      }
      var requestType =
        customDialog.dsType == 'dataSource'
          ? 'GET'
          : customDialog.requestType
          ? customDialog.requestType
          : 'POST'
      var url =
        '${form}/form/customDialog/v1/getTreeData?alias=' +
        pageParam.alias +
        '&mapParam=' +
        mapParam
      var paramsObj = {}
      if (customDialog.dsType != 'dataSource') {
        url = customDialog.url
        var templatePa = customDialog.dataParam
        if (customDialog.conditionfield) {
          var conditions = JSON.parse(customDialog.conditionfield)
          for (var i = 0; i < conditions.length; i++) {
            var con = conditions[i]
            if (requestType == 'POST') {
              if (templatePa) {
                templatePa = templatePa.replace(
                  new RegExp('\\{' + con.field + '\\}', 'g'),
                  con.defaultValue
                )
              } else {
                paramsObj[con.field] = con.defaultValue
              }
            } else {
              var ljChar = url.indexOf('?') == -1 ? '?' : '&'
              url = url + ljChar + con.field + '=' + con.defaultValue
            }
          }
          if (templatePa) {
            paramsObj = JSON.parse(templatePa)
          }
        }
      }
      var requestParams = {}
      requestParams.requestType = requestType
      requestParams.url = url
      requestParams.paramsObj = paramsObj
      this.searchTree(requestParams, defaultPValue)
      this.customDialogShowTree = true
    },
    //树形查询
    searchTree(requestParams, defaultPValue) {
      const this_ = this
      let query =
        requestParams.requestType == 'POST'
          ? req.post(requestParams.url, requestParams.paramsObj)
          : req.get(requestParams.url)
      query.then(function (response) {
        //显示字段配置
        let displayfield = JSON.parse(this_.customDialog.displayfield)
        this_.displayFieldList = displayfield
        //把对话框配置的显示字段显示名称赋值给树形的显示值
        this_.defaultProps.label = displayfield.displayName
        this_.treeList = response.data
        //得到要加载树的信息
        if (defaultPValue) {
          displayfield.pvalue = defaultPValue
        }
        this_.props1 = this_.toTreeData(
          response.data,
          displayfield.id,
          displayfield.pid,
          displayfield.displayName,
          displayfield.pvalue ? displayfield.pvalue : 0
        )
      })
    },
    //加载树的信息
    toTreeData(data, id, pid, name, pvalue) {
      // 建立个树形结构,需要定义个最顶层的父节点，pvalue是0
      return this.translateDataToTree(data, pid, id, name, pvalue)
    },
    translateDataToTree(data, pid, id, name, pvalue) {
      //把树数据有子节点的数据全部过滤掉（只留父节点的数据）
      let parents = data.filter(
        (value) =>
          value[id] == value[pid] || value[pid] == null || value[pid] == pvalue
      )
      if (!parents) {
        parents = data.filter(
          (value) =>
            value[pid] !== 'undefined' &&
            value[pid] != null &&
            value[id] != value[pid]
        )
      }
      return parents
    },
    loadTree(node, resolve) {
      if (node) {
        let this_ = this
        let displayFieldList =
          this_.customDialog.style == 2
            ? this_.combiTreeDisplayField
            : this_.displayFieldList
        resolve(
          this.treeList.filter(
            (value) =>
              value[displayFieldList.pid] === node.data[displayFieldList.id]
          )
        )
        if (this.showData && this.showData.length > 0) {
          setTimeout(() => {
            this.showData.forEach((v) => {
              if (v.Pid == node.key) {
                this_.$refs.tree.setChecked(v, true)
              } else {
                this_.checkNode(v, this_)
              }
            })
          }, 400)
        }
      }
    },

    afterOpen() {
      //打开对话框之后加载树
      this.loadCombinationTree()
    },
    loadCombinationTree() {
      if (this.customDialog.style != 2) {
        return
      }
      let combinationRule = JSON.parse(this.customDialog.combinationRule)
      this.combinationRule = combinationRule
      let treeAlias = combinationRule.leftTree
      //获取对话框数据
      req
        .get('${form}/form/customDialog/v1/getByAlias?alias=' + treeAlias)
        .then((resp) => {
          let treeDialog = resp.data
          this.leftTreeTitle = treeDialog.name
          let reqParam = {}
          let requestType =
            treeDialog.dsType == 'dataSource'
              ? 'GET'
              : treeDialog.requestType
              ? treeDialog.requestType
              : 'POST'
          let url =
            '${form}/form/customDialog/v1/getTreeData?alias=' +
            treeAlias +
            '&mapParam='
          let paramsObj = {}
          if (treeDialog.dsType != 'dataSource') {
            url = treeDialog.url
            let templatePa = treeDialog.dataParam
            if (treeDialog.conditionfield) {
              let conditions = JSON.parse(treeDialog.conditionfield)
              for (let i = 0; i < conditions.length; i++) {
                let con = conditions[i]
                if (requestType == 'POST') {
                  if (templatePa) {
                    templatePa = templatePa.replace(
                      new RegExp('\\{' + con.field + '\\}', 'g'),
                      con.defaultValue
                    )
                  } else {
                    paramsObj[con.field] = con.defaultValue
                  }
                } else {
                  let ljChar = url.indexOf('?') == -1 ? '?' : '&'
                  url = url + ljChar + con.field + '=' + con.defaultValue
                }
              }
              if (templatePa) {
                paramsObj = JSON.parse(templatePa)
              }
            }
          }
          let requestParams = {}
          requestParams.requestType = requestType
          requestParams.url = url
          requestParams.paramsObj = paramsObj
          this.$store
            .dispatch('dialog/getTreeData', requestParams)
            .then((resp) => {
              if (treeDialog.displayfield && treeDialog.resultfield) {
                let displayFieldList = JSON.parse(treeDialog.displayfield)
                let resultfield = JSON.parse(treeDialog.resultfield)
                this.defaultProps.label = displayFieldList.displayName
                this.treeList = resp
                this.combiTreeDisplayField = displayFieldList
                this.combinationTreeData = this.toTreeData(
                  resp,
                  displayFieldList.id,
                  displayFieldList.pid,
                  displayFieldList.displayName,
                  displayFieldList.pvalue ? displayFieldList.pvalue : '0',
                  resultfield
                )
              }
            })
        })
    },
    combiTreeClick(paramObj, node, nodeComponent) {
      //组合对话框点击左树
      //清空旧的
      this.combinationTreeQuerys.splice(0)
      let combinationRule = JSON.parse(this.customDialog.combinationRule)
      if (!combinationRule.rules || combinationRule.rules.length == 0) {
        return
      }
      let rules = combinationRule.rules
      for (let i = 0; i < rules.length; i++) {
        let value = paramObj[rules[i].treeField]
        let property = rules[i].listField
        this.combinationTreeQuerys.push({
          property: property,
          value: value,
          group: 'treeGroup',
          operation: this.getOperation(rules[i].condition),
          relation: 'AND',
        })
      }
      this.search()
    },
    //获取运算符号
    getOperation(old) {
      if (!old) {
        return ''
      }
      if (old == 'EQ') {
        return 'EQUAL'
      }
      if (old == 'LK') {
        return 'LIKE'
      }
      if (old == 'LFK') {
        return 'LIKE'
      }
      if (old == 'IN') {
        return 'IN'
      }
    },
    toggleTree() {
      if (this.treeShow) {
        this.treeShow = false
        this.transtionWidth = '0%'
        this.toggleBtn = 'el-icon-arrow-right'
      } else {
        this.treeShow = true
        this.transtionWidth = '25%'
        this.toggleBtn = 'el-icon-arrow-left'
      }
    },
    //ccwgq 2022-08-25 链接点击跳转查询
    handleLinkClick(obj) {
      if (this.disabled) return
      //TODO:后期加入JS逻辑、跳转提醒、以及跳转路径校验等
      const platform = obj.platform === undefined ? true : obj.platform
      if (platform && obj.link) {
        const regExp = /^http(s)*/
        if (regExp.test(obj.link)) {
          window.open(obj.link)
          return
        }
        //取出token
        let s = sessionStorage.getItem('currentUser')
        s = JSON.parse(s)
        window.open(
          window.context.front +
            obj.link +
            '&close=window' +
            '&token=' +
            s.token
        ) //打开新的窗口
        // this.$router.push(obj.link) //事务平台内的路径跳转
      } else if (obj.link) window.open(obj.link)
    },
    //ccwgq 2022-08-25 根据路径获取字段的值
    getFieldValue(path) {
      let {index: subIndex} = hotentUiUtils.getSubScopeElAndIndex(this.$el)
      let {index: sunIndex} = hotentUiUtils.getSunScopeElAndIndex(this.$el)
      const vm = utils.getOnlineFormInstance(this)
      let val = []
      if (vm.data) {
        val = utils.getValueByPath(vm, 'data.' + path, subIndex, sunIndex)
      }
      try {
        val = JSON.parse(val)
      } catch {}
      return val
    },
  },
  beforeDestroy() {},
}
</script>
<style lang="scss" scoped>
/deep/ .focusing {
  outline: none;
}
.relative-link {
  color: #4693f0;
  cursor: pointer;
  &:hover {
    text-decoration: underline;
  }
}
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

/deep/ .el-table__header {
  tr {
    display: table-row !important;
  }
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

/deep/ .el-tag{
  margin-bottom: 4px;
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
//ccwgq 2022-08-18 修复 select 样式
.search-item {
  /deep/ .el-select {
    .el-input {
      width: 180px;
    }
  }
}
</style>

<style>
.title-tooltip {
  font-size: 11pt !important;
  max-width: 35%;
  margin-top: 40px;
}
</style>
