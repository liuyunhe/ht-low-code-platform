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
        >
          <span style="width: fit-content">
            <span
              class="el-tag el-tag--info el-tag--small"
              @click.stop
              v-for="(item, index) in showList"
              :key="index"
              style="margin-right: 8px"
            >
              <span>
                <span class="el-select__tags-text">{{ item.value }}</span>
                <i
                  v-if="itemRemovable(item, saveHistory)"
                  class="el-tag__close el-icon-close"
                  @click="removeSelectOrg(item, index)"
                ></i>
              </span>
            </span>
          </span>
        </span>
        <div class="el-input el-input--suffix">
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
              color: '#fff',
              height: inputSuffixHeight + 'px',
            }"
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
                  class="icon-department"
                  :style="{
                    fontSize: '17px',
                    lineHeight: inputSuffixHeight + 'px',
                  }"
                ></i
                >业务条线</el-button
              >
            </span>
          </div>
        </div>
      </div>
    </el-tooltip>
    <span v-if="!inputWriteable">
      <span>
        <span
          class="el-tag el-tag--info el-tag--small"
          style="margin-right: 8px"
          @click.stop
          v-for="item in inputVal"
          :key="item.value"
        >
          <span class="el-select__tags-text">{{ item.value }}</span>
        </span>
      </span></span
    >
    <el-dialog
      :visible.sync="dialogVisible"
      :close-on-click-modal="false"
      :before-close="dialogCancel"
      top="6vh"
      width="60%"
      @opened="afterOpen"
      append-to-body
    >
      <template slot="title">
        <span style="font-size: 16px; marin-right: 15px">{{
          selfTitle || '选择业务条线'
        }}</span>
      </template>
      <el-container :style="style" style="overflow: auto">
        <!-- 查询参数 -->
        <el-header class="middle-header" v-if="querysShow"> </el-header>
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
            <!-- 复选框 -->
            <el-table-column
              type="selection"
              align="center"
              width="45"
              v-if="selectType == 'multiple'"
              :selectable="dataAllowClick"
            ></el-table-column>
            <!-- 单选框 -->
            <el-table-column
              align="center"
              width="50"
              v-if="selectType == 'single'"
            >
              <template v-slot="{$index}">
                <el-radio
                  @selection-change="orgTableSelection"
                  :label="$index"
                  v-model="radioval"
                  class="textRadio"
                  >&nbsp;</el-radio
                >
              </template>
            </el-table-column>
            <el-table-column
              type="index"
              width="65"
              align="center"
              label="序号"
            >
              <template v-slot="{$index}">
                <span>{{
                  (pagination.page - 1) * pagination.pageSize + $index + 1
                }}</span>
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
      </el-container>
      <span slot="footer" class="dialog-footer" style="text-align: center">
        <el-button size="small" type="primary" @click="dialogConfirm"
          >确认</el-button
        >
        <el-button size="small" @click="dialogCancel">取 消</el-button>
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
import req from '@/request.js'
import sub_pio_mixin from '@/sub-permission-mixin.js'
import {cloneDeep} from 'lodash'
//追加业务条线对话框,权限控制，不参与流程
export default {
  name: 'AddBusinessLineDialog',
  props: [
    'atter',
    'validate',
    'placeholder',
    'value',
    'permission',
    'custdialog',
    'tooltipplacement',
  ],
  data() {
    return {
      dialogVisible: false,
      style: 'height:440px', //对话框宽高
      customDialog: {},
      writeable: true,
      saveHistory: true,
      selfTitle: '',
      inputSuffixHeight: 33,
      inputSuffixWidth: 0,
      idValue: '',
      showList: [],
      placeholderBo: '',
      selectOrgs: [],
      oldselectOrgs: [],
      checkBoxDataAll: [],
      showData: [],
      displayfield: [],
      displayFieldList: {},
      customDialog: {},
      selectType: 'single',
      querysShow: false, //是否显示搜索框
      queryParam: '', //查询条件输入的值
      queryParams: [],
      pagination: {
        page: 1,
        pageSize: 9999,
        total: 0,
      },
      param: [], //绑定的表单字段
      radioval: '',
      placeholders: [],
      oldValue: '',
      oldIdValue: '',
      oldList: [],
      isCurrentChange: false,
    }
  },
  mixins: [sub_pio_mixin], //混入方式引入表单组件中公共属性，处理子表、孙表行内联动（切面修改permission_sub）
  computed: {
    ...mapState({
      total: (state) => state.dialog.total,
      dialogData: (state) => state.dialog.rows,
    }),
    inputVal: {
      set: function (val) {
        this.$emit('input', val)
      },
      get() {
        const idValue = this.idValue || ''
        const value = this.value || ''
        const valueList = value.split(',')
        const idList = idValue.split(',')
        if (!!idValue && !!value && valueList.length === idList.length) {
          this.showList = valueList.map((item, index) => {
            return {
              value: item,
              id: idList[index],
            }
          })
          return this.showList
        } else {
          this.showList = []
          return valueList.map((item) => {
            return {
              value: item,
            }
          })
        }
      },
    },
    inputWriteable: function () {
      // return false;
      return this.writeable
        ? utils.getWriteable(this.permission)
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
    oldValueList: function () {
      const oldValue = this.oldValue ?? ''
      if (oldValue) {
        return oldValue.split(',')
      }
      return []
    },
    oldIdList: function () {
      const oldIdValue = this.oldIdValue ?? ''
      if (oldIdValue) {
        return oldIdValue.split(',')
      }
      return []
    },
  },
  created() {
    this.saveHistory = this.custdialog.openHistory
    this.selfTitle = this.custdialog.selfTitle
    this.selectType = this.custdialog.selectType
    if (!this.placeholder) {
      this.placeholderBo = '请选择内容'
    } else {
      this.placeholderBo = this.placeholder
    }
    this.$validator = this.$root.$validator
  },
  mounted() {
    this.idValue = this.getIdValue()
    this.oldIdValue = this.idValue
    this.oldValue = this.value
    const idList = (this.oldIdValue ?? '').split(',')
    this.calacInputSuffixHeight()
    this.calacInputSuffixWidth()
  },
  watch: {
    value(val) {
      this.$nextTick(() => {
        this.calacInputSuffixWidth()
      })
    },
    dialogData(val) {
      this.selectOrgs = []
      if (this.saveHistory && this.selectType == 'multiple') {
        this.$nextTick(() => {
          val.forEach((s, index) => {
            if (
              this.oldIdList.includes(s['id_']) ||
              this.indexArray(this.showData, s) > -1
            ) {
              this.$refs.orgTable.toggleRowSelection(val[index], true)
            }
          })
        })
      }
      // this.selectOrgs.push(...this.showData)
    },
  },
  methods: {
    showDialog() {
      const alias = this.custdialog.alias
      if (this.showData?.length ?? 0) {
        this.selectOrgs = this.showData
      } else {
        this.selectOrgs = []
      }
      const that = this
      this.$store.dispatch('form/getByAlias', alias).then((customDialog) => {
        if (!customDialog || !customDialog.alias) {
          Message.error('对话框别名【' + alias + '】不存在！')
          return
        }
        that.customDialogShow({alias: alias, customDialog: customDialog})
      })
    },
    //加载数据
    search(resetPagintion) {
      let querys = [] //查询条件
      let queryFilter = {}
      if (JSON.stringify(this.pagination) == '{}') {
        this.pagination = {page: '1', pageSize: '9999', showTotal: 'true'}
      }
      let pageBean = {pageBean: this.pagination}
      if (resetPagintion) {
        pageBean.pageBean = {page: '1', pageSize: '9999', showTotal: 'true'}
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
    customDialogShow(pageParam) {
      this.dialogVisible = true
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
    checkList() {
      const that = this
    },
    dataAllowClick(row) {
      if (this.saveHistory) {
        return !this.oldIdList.includes(row['id_'])
      }
      return true
    },
    //数据同步
    syncInputValue(data) {
      const nameList = data.map((item) => item['value'])
      const idList = data.map((item) => item['id'])
      let value = nameList.join(',')
      let idValue = idList.join(',')
      this.$emit('input', value)
      const {index: subIndex} = hotentUiUtils.getSubScopeElAndIndex(this.$el)
      const {index: sunIndex} = hotentUiUtils.getSunScopeElAndIndex(this.$el)
      const vm = utils.getOnlineFormInstance(this)
      const path = this.custdialog.id
      utils.setValueByPath(vm, 'data.' + path, idValue, subIndex, sunIndex)
      this.idValue = idValue
    },
    removeSelectOrg(item, index) {
      let list = cloneDeep(this.inputVal)
      list.splice(index, 1)
      this.syncInputValue(list)
    },
    getIdValue() {
      const {index: subIndex} = hotentUiUtils.getSubScopeElAndIndex(this.$el)
      const {index: sunIndex} = hotentUiUtils.getSunScopeElAndIndex(this.$el)
      const path = this.custdialog.id
      const vm = utils.getOnlineFormInstance(this)
      if (vm) {
        return utils.getValueByPath(vm, 'data.' + path, subIndex, sunIndex)
      } else {
        return ''
      }
    },
    itemRemovable(item, flag) {
      return flag ? !this.oldIdList.includes(item['id']) : true
    },
    calacInputSuffixHeight() {
      setTimeout(() => {
        if (!this.$refs.tagSpans) return
        if (this.$refs.tagSpans.offsetHeight) {
          this.inputSuffixHeight = this.$refs.tagSpans.offsetHeight + 5
        } else {
          this.inputSuffixHeight = 30
        }
        // 触发验证
        this.$validator.validate()
      }, 0)
    },
    //计算宽度防止遮挡
    calacInputSuffixWidth() {
      setTimeout(() => {
        const el = this.$refs?.['inputSuffix'] ?? null
        this.inputSuffixWidth = el?.offsetWidth ?? 0
      }, 0)
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
    dialogCancel() {
      const that = this
      that.queryParam = ''
      that.$store.dispatch('dialog/setDialogData', []).then(() => {
        that.dialogVisible = false
        that.selectOrgs = [...that.showData]
        that.checkBoxDataAll = [...that.selectOrgs]
      })
    },
    afterOpen() {},
    //列表复选框有改变时触发
    orgTableSelection(selection) {
      this.oldselectOrgs = cloneDeep(this.selectOrgs)
      //多选
      if (this.selectType == 'multiple' && !this.isCurrentChange) {
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
    //确认
    dialogConfirm() {
      this.queryParam = ''
      this.dialogVisible = false
      this.calacInputSuffixHeight()
      if (this.saveHistory) {
        this.selectOrgs = this.selectOrgs.filter((item) => {
          return !this.oldIdList.includes(item['id_'])
        })
      }
      if (this.selectOrgs.length) {
        this.showData = this.selectOrgs
      }
      let idList = this.selectOrgs.map((item) => item['id_'])
      let nameList = this.selectOrgs.map((item) => item['name_'])
      let id_list = cloneDeep(this.oldIdList)
      let value_list = cloneDeep(this.oldValueList)
      id_list.push(...idList)
      value_list.push(...nameList)
      const data = value_list.map((item, index) => {
        return {
          value: value_list[index],
          id: id_list[index],
        }
      })
      this.syncInputValue(data)
      this.$store.dispatch('dialog/setDialogData', [])
    },
    //重置
    reset() {},
    //点击列表某一条数据时触发
    orgRowClick(row, column, event) {
      if (this.selectType === 'single') {
        $(event.currentTarget.children[0].children[0].children[0]).trigger(
          'click'
        )
        this.selectOrgs = []
        this.selectOrgs.push(row)
      } else {
        if (this.saveHistory) {
          if (this.oldIdList.includes(row['id_'])) return
        }
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
  },
}
</script>
<style lang="scss" scoped>
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
</style>
