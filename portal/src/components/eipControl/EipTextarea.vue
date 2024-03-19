<template>
  <div class="inputs" ref="inputs" :style="{textAlign: textAlign}">
    <ht-input
      :width="width"
      style="width: 100%"
      size="small"
      :validate="inputValidate"
      :name="inputName"
      :placeholder="placeholder ? placeholder : '请输入内容'"
      v-model="inputVal"
      :ref="this.atter"
      type="textarea"
      :disabled="isInputEdit == 'true' ? true : false"
      v-if="!isEditor && type != 'property-text'"
      :permission="permission_sub"
    ></ht-input>
    <!-- <span v-if="type=='property-text' &&!isEditor && permission_sub!='n'" v-html="inputVal"></span> -->
    <vue-ueditor-wrap
      ref="edit1"
      class="property_text"
      v-if="
        type == 'property-text' &&
        !isEditor &&
        permission_sub != 'n' &&
        showEditor
      "
      :key="key"
      v-model="inputVal"
      :config="config_text"
    ></vue-ueditor-wrap>
    <vue-ueditor-wrap
      :ref="this.atter"
      v-model="inputVal"
      :key="key"
      :config="config"
      v-if="isEditor && permission_sub != 'n' && showEditor"
    ></vue-ueditor-wrap>
    <!--用来控制富文本校验-->
    <ht-input
      size="small"
      :validate="inputValidate"
      :permission="permission_sub"
      :name="inputName"
      v-if="isEditor"
      v-model="inputVal"
      :ref="this.atter"
      v-show="false"
      type="input"
    ></ht-input>
  </div>
</template>

<script>
import utils from '@/utils.js'
import hotentUiUtils from '@/hotent-ui-util.js'
import {Base64} from 'js-base64'
import sub_pio_mixin from '@/sub-permission-mixin.js'
export default {
  name: 'eip-textarea',
  props: [
    'validate',
    'value',
    'name',
    'permission',
    'atter',
    'type',
    'initialFrameHeight',
    'initialFrameWidth',
    'placeholder',
    'isEditor',
    'noToolbar',
    'isInputEdit',
    'textValue',
    'precision',
    'textAlign',
  ],
  mixins: [sub_pio_mixin], //混入方式引入表单组件中公共属性，处理子表、孙表行内联动（切面修改permission_sub）
  data() {
    return {
      config_text: {
        initialFrameHeight: 50,
        UEDITOR_HOME_URL:
          window.location.origin +
          '/' +
          window.location.pathname.split('/')[1] +
          '/static/ueditor/',
        toolbars: [],
        elementPathEnabled: false, //是否启用元素路径，默认是true显示
        wordCount: false, //是否开启字数统计
        // 初始容器宽度
        initialFrameWidth: '100%',
        zIndex: 99,
        enableAutoSave: false,
        readonly: true,
      },
      width: '100%',
      unwatchAry: [],
      newValidate: null,
      data: {},
      key: 'edit',
      showEditor: false,
    }
  },
  methods: {
    getObjectValue(text, t, v) {
      let start = ''
      let end = ''
      if (!text && v) {
        return v
      }
      //start = text.substring(0, text.indexOf("{"));
      //end = text.substring(text.lastIndexOf("}") + 1, text.length);
      let val2 = text
        .substring(text.indexOf('{') + 2, text.indexOf('}'))
        .split('.')
      if (val2.length == 1) {
        return text
      }
      let rtn = ''
      let regVal = null
      let reg = /\{\{[\.\d\w]+\}\}/
      let check = new RegExp('[\u4e00-\u9fa5]')
      //从左到右遍历text，将匹配到的bo数据替换到返回值中
      while ((regVal = reg.exec(text)) != null) {
        rtn += text.substr(0, regVal.index)
        let val = regVal[0]
        if (
          check.test(val.replace(/(\{\{)|(\}\})/g, '')) ||
          !val.startsWith('{{data.')
        ) {
          rtn += val
          text = text.substr(regVal.index + val.length)
          continue
        }
        let length = val.length
        val = val.replace(/(\{\{)|(\}\})/g, '')
        let arr = val.split('.').splice(1)
        if (arr.length == 2) {
          //主表     ["mainEnt", "field"]
          if (t.data[arr[0]][arr[1]]) {
            rtn += t.data[arr[0]][arr[1]]
          }
          text = text.substr(regVal.index + length)
        } else if (arr.length == 3) {
          //子表     ["mainEnt", "sub_"+"subEnt", "field"]
          let subIndex = utils.getSomeAttributeFromParentElement(
            t.$el,
            'sub-index'
          ) //子表下标
          let curData = t.data[arr[0]][arr[1]][subIndex] //子表单行数据
          if (curData[arr[2]]) {
            rtn += curData[arr[2]]
          }
          text = text.substr(regVal.index + length)
        }
      }
      //添加剩下的数据到返回值中
      if (text) {
        rtn += text
      }
      return rtn
      // let check = new RegExp("[\u4e00-\u9fa5]");
      // val = val.filter(v =>{
      //   return v != "data";
      // })
      // if(check.test(val)){
      //   return text;
      // }
      // if(val.length==2){//主表
      //   if(t.data[val[0]][val[1]]){
      //     return start + t.data[val[0]][val[1]] + end;
      //   }else if(!start && !end){
      //     return "''";
      //   }
      //   return start + "" + end;
      // }else  if(val.length==3){//子表
      //   //获取子表的下标
      //   let subIndex = utils.getSomeAttributeFromParentElement(t.$el,"sub-index");
      //   let attrArr = t.atter.split(".");
      //   let attr = attrArr[attrArr.length -1];
      //   let data = t.data[val[0]][val[1]];
      //   data.forEach(v =>{
      //     if(v[val[2]] != v[attr]){
      //       v[attr] = start +v[val[2]] + end;
      //     }
      //   })
      //   if (start + data[subIndex][val[2]] + end) {
      //     return start + data[subIndex][val[2]] + end;
      //   }else if(!start && !end){
      //     return "''";
      //   }
      // }
    },
    getField(data, fieldArr) {
      if (!data || !fieldArr || fieldArr.length < 3 || fieldArr[0] != 'data') {
        return ''
      }
      if (fieldArr.length == 3) {
        //子表
      }
    },
  },
  computed: {
    inputVal: {
      get() {
        let _this = this
        _this.data = _this.$parent.$vnode.context.$vnode.context.data
        let text = ''
        if (this.textValue) {
          text = Base64.decode(this.textValue)
        }
        if (!this.value) {
          let moment = require('moment')
          if (text) {
            setTimeout(() => {
              let isJoin = false
              if (text.indexOf('{发起时间:startDate}') != -1) {
                text = text.replace(
                  /\{发起时间:startDate}/g,
                  '发起时间:' + moment().format('YYYY-MM-DD') + ' '
                )
                isJoin = true
              }
              if (text.indexOf('{发起人:startUser}') != -1) {
                let currentUser = this.$store.state.user.currentUserDetail.user
                text = text.replace(
                  /\{发起人:startUser}/g,
                  '发起人:' + currentUser.fullname + ' '
                )
                isJoin = true
              }
              if (text.indexOf('{所在部门:userOrg}') != -1) {
                let currentOrg = this.$store.state.user.currentOrgDetail
                var name = '无'
                if (currentOrg && currentOrg.name) {
                  name = currentOrg.name
                }
                text = text.replace(
                  /\{所在部门:userOrg}/g,
                  '所在部门:' + name + ' '
                )
                isJoin = true
              }
              if (!isJoin) {
                text = _this.getObjectValue(text, _this)
              }
              this.$emit('input', text)
              return text
            }, 900)
          }
        } else {
          return _this.getObjectValue(text, _this, this.value)
        }
      },
      set(val) {
        this.$emit('input', val)
      },
    },
    text: function () {
      if (this.textValue) {
        return Base64.decode(this.text)
      }
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
    inputValidate: function () {
      if (this.newValidate) {
        return this.newValidate
      }
      return this.validate
    },
    config: function () {
      // lyzcw: 关闭源代码、附件上传及超链工具条按钮，todo: 控件属性里配置, 2021-05-20 17:15
      let configTemp = {
        initialFrameHeight: 240,
        UEDITOR_HOME_URL:
          window.location.origin +
          '/' +
          window.location.pathname.split('/')[1] +
          '/static/ueditor/',
        toolbars: [
          [
            // 'source', //源代码
            'undo', //撤销
            'bold', //加粗
            'indent', //首行缩进
            'italic', //斜体
            'underline', //下划线
            'strikethrough', //删除线
            'subscript', //下标
            'fontborder', //字符边框
            'superscript', //上标
            'formatmatch', //格式刷
            'forecolor', //字体颜色
            'justifyleft', //居左对齐
            'justifycenter', //居中对齐
            'justifyright', //居右对齐
            'justifyjustify', //两端对齐
            'fontfamily', //字体
            'fontsize', //字号
            'insertorderedlist', //有序列表
            'insertunorderedlist', //无序列表
            'lineheight', //行间距
            'inserttable', //插入表格
            // 'link', //超链接
            // 'simpleupload', //单图上传
            // 'insertimage', //多图上传
            // 'attachment', //附件
          ],
        ],
        elementPathEnabled: false, //是否启用元素路径，默认是true显示
        wordCount: true, //是否开启字数统计
        autoHeightEnabled: false, //是否自动长高
        // 初始容器宽度
        initialFrameWidth: '100%',
        zIndex: 90,
        enableAutoSave: false,
        readonly: false,
      }
      //是否显示工具栏
      if (this.noToolbar || this.permission_sub == 'r') {
        configTemp.toolbars = []
      }
      return configTemp
    },
  },
  async mounted() {
    const {subScopeEl, index} = hotentUiUtils.getSubScopeElAndIndex(this.$el)
    //如果是编辑或者必填的情况下。但是该行不允许编辑，则将权限修改为只读
    if (
      subScopeEl &&
      (subScopeEl.getAttribute('row_readonly') == 'true' ||
        subScopeEl.getAttribute('row_readonly') === true) &&
      (this.permission_sub == 'w' || this.permission_sub == 'b')
    ) {
      this.permission_sub = 'r'
    }

    if (this.initialFrameHeight) {
      this.config.initialFrameHeight = this.initialFrameHeight
    }
    if (this.initialFrameWidth) {
      this.config.initialFrameWidth = this.initialFrameWidth
    }
    if (this.isInputEdit || this.permission_sub == 'r') {
      this.config.readonly = true
    }
    this.showEditor = true
  },
  watch: {
    permission(value) {
      if (value == 'w') {
        // this.showEditor = false
        this.$nextTick(() => {
          // this.showEditor = true
          this.key = new Date().getTime()
        })
      }
    },
  },
  created() {
    this.$validator = this.$root.$validator
  },
}
</script>
<style lang="scss" scoped>
div[aria-invalid='true'] /deep/ .el-input__inner,
div[aria-invalid='true'] /deep/ .el-input__inner:focus {
  border-color: #f56c6c;
}
div .property_text /deep/ .edui-default /deep/ .edui-editor {
  border: 0;
}
</style>
