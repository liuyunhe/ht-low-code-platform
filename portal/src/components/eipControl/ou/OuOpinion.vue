<template>
  <div v-if="permission !== 'n'" role="opinion">
    <ul class="ou-opinion__container">
      <li v-for="(opinion, index) in showList" :key="index">
        <div
          class="opinion-item"
          :style="{
            borderBottom:
              dividerLine == 'none' ? '' : `1px ${dividerLine} black`,
          }"
          v-if="moreVisible ? index < defaultNumber : true"
        >
          <div
            v-html="dealRawOpinionText(opinion.opinionText)"
            class="opinion-text"
          ></div>
          <div :style="{textAlign: userInfoAlign}" v-if="opinion.creater">
            <span>{{ opinion.creater }}</span>
            <span v-if="showDepartInfo || showDate || showTime">/</span>
            <span v-if="showDepartInfo">{{ opinion.department }}</span>
            <span v-if="!showDate && !showTime">&nbsp;&nbsp;</span>
            <span v-if="showDate">{{ formatDate(opinion.create_time) }}</span>
            <span v-if="showTime"
              ><span>&nbsp;</span>{{ formatTime(opinion.create_time) }}</span
            >
          </div>
        </div>
      </li>
    </ul>
    <span v-if="moreVisible" class="show-more" style="" @click="openDialog"
      >查看更多</span
    >
    <el-dialog
      :title="dialogTitle"
      :visible.sync="dialogVisible"
      append-to-body
      width="70%"
    >
      <ul class="dialog-opinion">
        <li v-for="(opinion, index) in showList" :key="index">
          <div
            class="opinion-item"
            :style="{
              borderBottom:
                dividerLine == 'none' ? '' : `1px ${dividerLine} black`,
            }"
          >
            <div
              v-html="dealRawOpinionText(opinion.opinionText)"
              class="opinion-text"
            ></div>
            <div :style="{textAlign: userInfoAlign}" v-if="opinion.creater">
              <span>{{ opinion.creater }}</span>
              <span v-if="showDepartInfo || showDate || showTime">/</span>
              <span v-if="showDepartInfo">{{ opinion.department }}</span>
              <span v-if="!showDate && !showTime">&nbsp;&nbsp;</span>
              <span v-if="showDate">{{ formatDate(opinion.create_time) }}</span>
              <span v-if="showTime"
                ><span>&nbsp;</span>{{ formatTime(opinion.create_time) }}</span
              >
            </div>
          </div>
        </li>
      </ul>
      <span slot="footer">
        <el-button type="danger" size="small" @click="closeDialog"
          >关闭</el-button
        >
      </span>
    </el-dialog>
  </div>
</template>
<script>
//流程意见组件,
//本组件不可编辑，只可以用于意见展示，
/**
 * @description 数据结构参考
 * [
 * {
 *   opinionText:'',意见
 *   creater:'',  创建人
 *   creater_id:'', 创建人id
 *   department:'',  所属部门
 *   department_id:'',所属部门id
 *   create_time:'',创建时间
 *   sort:'', //排序方式，正序或者倒序
 * }
 * ]
 *
 *  * */
import moment from 'moment'
import {mapState} from 'vuex'
import utils from '@/utils.js'
import hotentUiUtils from '@/hotent-ui-util.js'
import {Message} from 'element-ui'
import req from '@/request.js'
import sub_pio_mixin from '@/sub-permission-mixin.js'
export default {
  name: 'OuOpinion',
  props: [
    'validate',
    'value',
    'name',
    'permission',
    'sort',
    'dividerLine', //分割线样式，默认虚线 dashed
    'showDepartInfo',
    'showDate',
    'showTime',
    'datePattern',
    'timePattern',
    'userInfoAlign',
    //自定义脚本相关
    'useTextJs',
    'selfDiyJs',
    //弹窗查看更多支持
    'useDialog',
    'defaultNumber',
  ],
  model: {
    prop: 'value',
    event: 'input',
  },
  mixins: [sub_pio_mixin], //混入方式引入表单组件中公共属性，处理子表、孙表行内联动（切面修改permission_sub）
  data() {
    return {
      opinionList: [
        // {
        //   opinionText:
        //     '<p><font color="#ff0000"><b>部门合规专员提交</b></font></p>',
        //   creater: '张三',
        //   creater_id: '003',
        //   department: '首席律师',
        //   department_id: '00098',
        //   create_time: '2022-10-09 17:09:42',
        //   sort: 'desc'
        // },
        // {
        //   opinionText: '<p><font color="#ff0999"><b>归档提交</b></font></p>',
        //   creater: '李四',
        //   creater_id: '003',
        //   department: '金融科技线',
        //   department_id: '00098',
        //   create_time: '2022-10-10 11:09:42',
        //   sort: 'desc'
        // }
      ],
      // showList: [],
      dialogVisible: false, //弹窗控制
    }
  },
  computed: {
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
    dialogTitle(){
      const strList = this.inputName.split(['-']);
      if(strList.length==2){
        return strList[1]
      }
      return strList.length? strList[0] :'审批意见'
    },
    showList() {
      return this.sortOpinionList(this.opinionList)
    },
    moreVisible() {
      const num = this.defaultNumber ?? 0
      return num > 0 ? this.showList.length > num : false
    },
  },
  created() {
    this.$validator = this.$root.$validator
    // this.showList = this.sortOpinionList(this.opinionList)
    if (this.value && this.value.constructor === String) {
      try {
        this.opinionList = [...JSON.parse(this.value)]
        this.opinionList.forEach((item) => (item.sort = this.sort))
        if (this.opinionList.length > 0) {
          this.$emit('input', JSON.stringify(this.opinionList))
        } else {
          this.$emit('input', null)
        }
      } catch {
        new Error(`${this.inputName} parse to JSON occur error!`)
      }
    }
  },
  methods: {
    formatDate(dateTime) {
      return moment(new Date(dateTime).getTime()).format(
        this.datePattern || 'YYYY-MM-DD'
      )
    },
    formatTime(dateTime) {
      return moment(new Date(dateTime).getTime()).format(
        this.timePattern || 'HH:mm:ss'
      )
    },
    // 文本渲染到页面前进行处理
    dealRawOpinionText(text) {
      //TODO:逻辑抽取到自己的js脚本
      return text
    },
    //排序处理
    sortOpinionList() {
      if (this.sort === 'desc') {
        return this.opinionList.sort((pre, next) => {
          return new Date(pre.create_time).getTime() <
            new Date(next.create_time).getTime()
            ? 1
            : -1
        })
      } else {
        return this.opinionList.sort((pre, next) => {
          return new Date(pre.create_time).getTime() >
            new Date(next.create_time).getTime()
            ? 1
            : -1
        })
      }
    },
    openDialog() {
      if (this.moreVisible) {
        this.dialogVisible = true
      }
    },
    closeDialog() {
      this.dialogVisible = false
    },
  },
}
</script>

<style lang="scss" scoped>
.ou-opinion__container {
  list-style: none;
}
.show-more {
  float: right;
  color: #409eff;
  cursor: pointer;
}
.dialog-opinion {
  * {
    font-size: 11pt;
  }
  list-style: none;
  .opinion-item{
    margin-bottom: 8px;
  }
}
</style>
