<template>
  <el-form data-vv-scope="field" size="small" inline>
    <!-- 自定义控件宽高 isWidth-->
    <template v-if="field.options.isWidth">
      <ht-form-item label label-width>
        <template slot="label">
          <el-tooltip content="是否设置控件的宽度 如 80%">
            <i class="property-tip icon-question" />
          </el-tooltip>
          <label>自定义控件宽度</label>
        </template>
        <el-input v-model="field.options.width" placeholder="宽度：100%" style="float: left;"/>
      </ht-form-item>
    </template>
    <!-- 统计函数 -->
    <template
      v-if="
        isBasicsProperty(field.options.basicsProperty, 'input') ||
          isBasicsProperty(field.options.basicsProperty, 'number') ||
          isBasicsProperty(field.options.basicsProperty, 'currency')
      "
    >
       <ht-form-item label="统计函数" label-width="100px" v-if="field.options.mathExp">
        <template slot="label">
          <el-tooltip content="函数统计将被移除，请使用公式编辑功能">
            <i class="property-tip icon-question" />
          </el-tooltip>
          <label>统计函数</label>
        </template>
        <span style="color:red;">请使用公式编辑功能</span>
      </ht-form-item>
      <el-popconfirm
        title="确定清空吗？"
        @onConfirm="clearFunction"
        trigger="hover"
        v-if="field.options.mathExp"
      >
        <el-button type="danger" slot="reference" class="el-icon-circle-close"
          >清空</el-button
        >
      </el-popconfirm>
      <br />
    </template>
    <!-- 标题字体样式 noTitle -->
    <template v-if="!field.noTitle">
      <ht-form-item label="标题字体样式" label-width="100px" v-if="!field.noTitle">
        <div>
          <el-switch v-model="field.options.boldLable" active-text="加粗"></el-switch>
          <el-switch
            v-model="field.options.hideCtrl"
            active-text="隐藏控件"
            style="margin-left:10px;"
          ></el-switch>
          <el-switch
            v-if="(data.parentNodeType!='sub'||(data.parentNodeType=='sub'&&data.parentType=='subDiv')) 
            && (data.parentNodeType!='sun'||(data.parentNodeType=='sun'&&data.parentType=='sunDiv'))"
            v-model="field.options.hideLabel"
            active-text="隐藏标题"
            style="margin-left:10px;"
          ></el-switch>
        </div>
        <div style="height: 0px;margin-top:10px;margin-bottom:20px;">
          <el-color-picker
            v-model="field.options.lableColor"
            v-show="
                      field.options.lableColor
                        ? (field.options.lableColor = field.options.lableColor)
                        : (field.options.lableColor = '#969799')
                    "
            size="mini"
          ></el-color-picker>
        </div>
      </ht-form-item>

      <!-- <ht-form-item
                v-if="isBasicsProperty(field.ctrlType, 'property-text')"
                label="内容对齐方式"
                label-width
              >
                <el-select v-model="field.options.textAlign" placeholder="">
                  <el-option label="左对齐" value="left"></el-option>
                  <el-option label="居中" value="center"></el-option>
                  <el-option label="右对齐" value="right"></el-option>
                </el-select>
              </ht-form-item> -->
    </template>

    <!-- 文件只读时的权限-->
    <template v-if="isBasicsProperty(field.ctrlType, 'ou-attachment')||isBasicsProperty(field.ctrlType, 'attachment') || isBasicsProperty(field.ctrlType, 'imageViewer')">
        <ht-form-item
                  label="文件只读时的权限"
                  label-width
                >
          <el-switch v-model="field.options.file.allowPreview" active-text="允许预览"></el-switch>
          <el-switch v-model="field.options.file.allowDownload" active-text="允许下载" style="margin-left:10px;"></el-switch>
        </ht-form-item>
    </template>

    <!-- 提示信息 tooltip-->
    <template v-if="!field.noTooltip">
      <ht-form-item label="提示信息(tooltip)" label-width="100px">
        <template slot="label">
          <el-tooltip content="字段的提示信息（tooltip）">
            <i class="property-tip icon-question" />
          </el-tooltip>
          <label>提示信息</label>
        </template>
        <el-button class="el-icon-edit" size="mini" @click="tipClick">编写内容</el-button>
        <el-button
          type="primary"
          icon="el-icon-search"
          size="mini"
          @click="editI18nMessage('tip')"
        >国际化</el-button>
      </ht-form-item>
    </template>

    <!-- 禁用isInputEdit-->
    <template v-if="isAdvancedProperty(field.options.advancedProperty, 'isInputEdit')">
      <ht-form-item label-width="100px">
        <el-checkbox v-model="field.options.isInputEdit">
          禁用
          <el-tooltip content="文本框为置灰状态并且不可编辑">
            <i class="property-tip icon-question" />
          </el-tooltip>
        </el-checkbox>
        <div style="width: 300px;"></div>
      </ht-form-item>
    </template>
    <template v-if="isBasicsProperty(field.ctrlType, 'input')">
      <ht-form-item label-width="100px">
        <el-checkbox v-model="field.options.isReadonly">
          不可编辑
          <el-tooltip content="文本框不可编辑">
            <i class="property-tip icon-question" />
          </el-tooltip>
        </el-checkbox>
        <div style="width: 300px;"></div>
      </ht-form-item>
    </template>
    <!-- 绑定流水号 isBindIdentity-->
    <template
      v-if="
        isAdvancedProperty(field.options.advancedProperty, 'isBindIdentity')
      "
    >
      <ht-form-item label-width="100px">
        <el-checkbox @change="identityCheck" v-model="field.options.isBindIdentity">
          绑定流水号
          <el-tooltip content="流程启动时生成流水号">
            <i class="property-tip icon-question" />
          </el-tooltip>
        </el-checkbox>
        <ht-form-item v-if="field.options.isBindIdentity" label="选择流水号" label-width="90px">
          <ht-select
            v-model="field.options.bindIdentityjson.alias"
            :options="identitys"
            :props="{ key: 'alias', value: 'name' }"
          />
        </ht-form-item>
      </ht-form-item>
      <!-- 获取单选复选控件动态值选项 @change="setCurrentCustomQuery()"-->
      <ht-load-data
        :url="identityUrl"
        requestMethod="post"
        context="portal"
        @after-load-data="afterLoadIdentityData"
      ></ht-load-data>
      <div style="width: 300px;"></div>
    </template>
    <!-- 富文本 isEditor-->
    <template v-if="isAdvancedProperty(field.options.advancedProperty, 'isEditor')">
      <ht-form-item label label-width>
        <template slot="label">
          <el-checkbox v-model="field.options.isEditor">富文本</el-checkbox>
        </template>
        <el-checkbox  v-if="field.options.isEditor" v-model="field.options.noToolbar">无工具栏</el-checkbox>
        <div v-if="field.options.isEditor">
          <el-input-number
            v-model="field.options.initialFrameHeight"
            value="150"
            placeholder="高度(px)"
            controls-position="right"
            :min="1"
            :max="1000"
            style="width:150px"
          ></el-input-number>
          <el-input-number
            v-model="field.options.initialFrameWidth"
            placeholder="宽度(px)"
            controls-position="right"
            :min="1"
            :max="1000"
            style="width:150px;float: left;"
          ></el-input-number>
        </div>
        <div v-if="!field.options.isEditor" style="width: 300px;"></div>
      </ht-form-item>
    </template>
    <!-- ccwgq 2022-10-11 是否支持只读时复制 -->
     <template
      v-if="
        isAdvancedProperty(field.options.advancedProperty, 'inputType') &&
          field.ctrlType !== 'number'
      "
    >
    <ht-form-item label-width="100px">
        <el-checkbox v-model="field.options.readCopy">
          只读时复制
          <el-tooltip content="字段只读时添加一个复制按钮可复制文本">
            <i class="property-tip icon-question" />
          </el-tooltip>
        </el-checkbox>
        <div style="width: 300px;"></div>
      </ht-form-item>
     </template>
    <!-- 是否密码框 inputType-->
    <template
      v-if="
        isAdvancedProperty(field.options.advancedProperty, 'inputType') &&
          field.ctrlType !== 'number'
      "
    >
      <ht-form-item label-width="100px">
        <el-checkbox v-model="field.options.inputType">
          是否密码框
          <el-tooltip content="文本框内容是否已密码的形式显示">
            <i class="property-tip icon-question" />
          </el-tooltip>
        </el-checkbox>
        <div style="width: 300px;"></div>
      </ht-form-item>
    </template>
    <!-- 绑定前缀、后缀 bindPreAndSufFix-->
    <template v-if="isAdvancedProperty(field.options.advancedProperty,'bindPreAndSufFix')">
      <ht-form-item label-width="100px">
        <el-checkbox v-model="field.options.isBindPreAndSufFix" @change="bindPreAndSufFixChange">
          绑定前缀、后缀
          <el-tooltip content="前缀文本框前部分固定的内容，后缀则后部分">
            <i class="property-tip icon-question" />
          </el-tooltip>
        </el-checkbox>
        <div style="width: 300px;"></div>
      </ht-form-item>
      <ht-form-item label-width="100px" label="前缀" v-if="field.options.isBindPreAndSufFix">
        <ht-input v-model="field.options.bindPreAndSufFixjson.preFix" @change="isNumberPrefix"></ht-input>
      </ht-form-item>
      <ht-form-item label-width="100px" label="后缀" v-if="field.options.isBindPreAndSufFix">
        <ht-input v-model="field.options.bindPreAndSufFixjson.sufSix"></ht-input>
      </ht-form-item>
    </template>
    <!--字段校验规则-->
    <template v-if="field.options.validateType != undefined && !field.options.isInputEdit">
      <ht-form-item label-width="260px">
        <template slot="label">
          <el-tooltip content="进行校验时，会按照从上至下的顺序依次校验">
            <i class="property-tip icon-question" />
          </el-tooltip>
          <span>字段校验<span style="color:red">(带*的支持EXCEL导入时校验)</span></span>
        </template>
        <ValidataProperty :data.sync="field" :boData.sync="mainBoFields" :fieldIndexData="fieldIndexData" />
      </ht-form-item>
    </template>

    <!-- 设置自定义脚本  script-->
    <template v-if="isAdvancedProperty(field.options.advancedProperty,'script')">
      <H3 style="margin-bottom: 0px;">设置控件执行的方法</H3>
      <el-button class="btn-padding" icon="el-icon-plus" @click="autoRunJSScript">设置自定义脚本</el-button>
    </template>

    <!-- 通用的不放在 template中-->
    <el-dialog
      title="统计函数"
      :visible.sync="dialogCountVisible"
      destroy-on-close
      append-to-body
      :close-on-click-modal="false"
    >
      <math-dialog
        :bo-def-data="boDefData"
        :visible.sync="dialogCountVisible"
        :math-exp.sync="field.options.mathExp"
      />
    </el-dialog>

    <el-dialog
      title="自定义运行脚本设置"
      :visible.sync="dialogScriptVisible"
      append-to-body
      class="urgent-text"
      :close-on-click-modal="false"
    >
      <div>
        <p>
          <span>
            <strong>备注：</strong>
          </span>
        </p>
        <p>只需要填写function内的业务逻辑 内置参数有</p>
        <code>
          function(req,data,i18n,Message,Loading,formVm,_this){
          <br />// 业务逻辑代码
          <br />// req 异步请求封装 可以查看带中的request.js
          <br />// i18n 国际化对象 i18n.t('login.login');
          // data 在线表单数据对象
          <br />// Message, Loading 分别ElementUI 的message 和 loading组件
          <br />// formVm form的vue实例对象 使用如下
          <br />// formVm.data 表单数据
          <br />// formVm.$t('login.login') 国际化
          <br />// _this 当前控件的vue对象 _this.inputVal 控件绑定的model值
          <br />}
          // 如果是设置树控件的脚本 多三个参数 nodeData节点数据 ,node节点对象,treeComponent 树组件对象
        </code>
        <p>如果设置了输入框 返回值将直接绑带到输入框中</p>
      </div>
      <ht-form-item label="自定义JS脚本" label-width>
        <ht-select
          clearable
          placeholder="选择表单变量"
          v-model="diyScript"
          :options="allBoData"
          :props="{key:'name',value:'desc'}"
          @change="diyScriptChange"
        >
          <template slot-scope="{options}">
            <el-option-group v-for="(group,idenx) in options" :key="idenx" :label="group.desc">
              <el-option
                v-for="item in group.children"
                :key="item.id"
                :label="item.desc"
                :value="'data.'+item.path+(group.nodeType=='sub'?'[0]':'')+'.'+item.name"
              ></el-option>
            </el-option-group>
          </template>
        </ht-select>
      </ht-form-item>
      <div style="width: 100%;height:100%;">
        <textarea
          v-model="scriptText"
          type="textarea"
          rows="15"
          autocomplete="off"
          ref="scriptText"
          style="width: 99%;height:100%;"
        ></textarea>
      </div>
      <div slot="footer" class="dialog-footer">
        <el-button type="primary" @click="scriptOk">确 定</el-button>
        <el-button @click="dialogScriptVisible = false;scriptText=''">取 消</el-button>
      </div>
    </el-dialog>
    <el-dialog
      title="字段提示"
      :visible.sync="dialogTipVisible"
      append-to-body
      class="urgent-text"
      :close-on-click-modal="false"
    >
      <htEditor v-model="tooltip" :config="myConfig"></htEditor>
      <div slot="footer" class="dialog-footer">
        <el-button
          type="primary"
          @click="
            dialogTipVisible = false;
            field.options.tip = tooltip;
          "
        >确 定</el-button>
        <el-button
          @click="
            dialogTipVisible = false;
            tooltip = '';
          "
        >取 消</el-button>
      </div>
    </el-dialog>
    <i18n-message-edit
      ref="i18nMessageEdit"
      :messageKey="i18nMessageKey"
      @after-save="afterSaveI18n"
    />
  </el-form>
</template>

<script>
    import ValidataProperty from "@/components/form/ValidataProperty.vue";
    import htEditor from "@/components/common/HtEditor.vue";
    import i18nMessageEdit from "@/components/system/I18nMessageEdit.vue";
    import MathDialog from "@/components/form/customView/MathDialog.vue";

    export default {
  name: "advabced-property",
  props: ["data", "mainBoFields", "allBoData", "boDefData", "fieldIndexData"],
  components: { ValidataProperty, htEditor, i18nMessageEdit, MathDialog },
  data() {
    return {
      myConfig: {
        initialFrameHeight: 240,
        UEDITOR_HOME_URL: window.location.origin +'/'+ window.location.pathname.split('/')[1]+'/static/ueditor/',
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
            'forecolor',//字体颜色
            'justifyleft', //居左对齐
            'justifycenter', //居中对齐
            'justifyright', //居右对齐
            'justifyjustify', //两端对齐
            'fontfamily', //字体
            'fontsize', //字号
            'insertorderedlist', //有序列表
            'insertunorderedlist', //无序列表
            'lineheight',//行间距
            'inserttable', //插入表格
          ]
        ],
        // 初始容器宽度
        initialFrameWidth: "100%",
        zIndex:9999,
        enableAutoSave: false,
        readonly : false
      },
      effectObj: {
        validateObj: {
          fieldPath: this.data.fieldPath,
          options: {
            validateList: [],
            validate: "",
            validateType:
              "confirmed|email|regex|min|max|min_value|max_value|isAfter|isBefore|isStart|isEnd|numeric|between|is|digits|mobile|required|alpha_spaces|alpha_dash|alpha_num|alpha|method"
          }
        }
      },
      field: this.data,
      customQuerys: [],
      customQueryUrl: "",
      fields: [],
      dialogLinkageVisible: false, //联动设置对话框
      linkage: [
        {
          value: "",
          effect: [
            {
              validateObj: {
                fieldPath: this.data.fieldPath,
                options: {
                  validateList: [],
                  validate: "",
                  validateType:
                    "confirmed|email|regex|min|max|min_value|max_value|isAfter|isBefore|isStart|isEnd|numeric|between|is|digits|mobile|required|alpha_spaces|alpha_dash|alpha_num|alpha|method"
                }
              }
            }
          ]
        }
      ], //联动表达式
      items: [
        //联动校验显示隐藏
        { key: "n", value: "隐藏" },
        { key: "w", value: "显示" },
        { key: "b", value: "必填" }
      ],
      identityUrl: "", //获取流水号数据url
      identitys: [], //流水号数据
      scriptText: "", //自定义js脚本对话框值
      isBnt: false, //是否按钮脚本
      diyScript: "", //自定义js脚本对话框表单值
      dialogScriptVisible: false, //自定义js脚本对话框
      dialogTipVisible: false,
      dialogCountVisible: false, //数字统计框
      tooltip: "",
      i18nMessageKey: "",
      createKeyMap: {
        text: true,
        image: true,
        "immediate-single": true,
        "immediate-textarea": true
      }
    };
  },
  mounted() {

    if (this.field.options.isBindIdentity){
      this.identityUrl = "/sys/identity/v1/getAll";
    }

    if (this.field.options.bindIdentityjson) {
      if (this.field.options.bindIdentityjson.alias) {
        this.identityCheck();
      }
    }
  },
  methods: {
    //判断控件是否有特殊基础属性
    isBasicsProperty(basicsProperty, alias) {
      if (basicsProperty && alias) {
        const basicsPropertys = basicsProperty.split("|");
        if (basicsPropertys.includes(alias)) {
          return true;
        } else {
          return false;
        }
      }
      return false;
    },
    clearFunction() {
      this.field.options.mathExp = undefined;
    },
    bindPreAndSufFixChange(model) {
      if (!model) {
        this.field.options.bindPreAndSufFixjson = {};
      }
    },
    afterSaveI18n(data) {
      data.key = data.key.replace("$", "#");
      if (data.prop.endsWith("placeholder")) {
        this.field.options.placeholder = data.key;
        this.field.options.placeholder_zh = data.desc;
      } else if (data.prop.endsWith("tip")) {
        this.tooltip = data.key;
      } else {
        this.field.desc = data.key;
        this.field.desc_zh = data.desc;
      }
    },
    editI18nMessage(after) {
      this.i18nMessageKey = this.field.fieldPath || this.field.path;
      if (this.createKeyMap[this.field.ctrlType]) {
        this.i18nMessageKey =
          this.formData.formKey +
          "." +
          this.field.ctrlType +
          Math.random() * 5000;
      }
      if (this.i18nMessageKey && after) {
        this.i18nMessageKey += after;
      }
      this.$refs.i18nMessageEdit.handleOpen();
    },
    //字段填写提示按钮
    tipClick() {
      this.dialogTipVisible = true;
      if (!this.field.options.tip) {
        this.tooltip = "";
        return;
      }
      this.tooltip = this.field.options.tip;
    },
    async diyScriptChange(myValue) {
      const myField = this.$refs.scriptText;
      var value = myValue;
      if (myField.selectionStart || myField.selectionStart === 0) {
        var startPos = myField.selectionStart;
        var endPos = myField.selectionEnd;
        this.scriptText =
          myField.value.substring(0, startPos) +
          value +
          myField.value.substring(endPos, myField.value.length);
        await this.$nextTick(); // 这句是重点, 圈起来
        myField.focus();
        myField.setSelectionRange(endPos + value.length, endPos + value.length);
      } else {
        this.scriptText += value;
      }
    },
    scriptOk() {
      this.dialogScriptVisible = false;
      if (!this.scriptText) {
        this.field.options.script = "";
        return;
      }
      if (!this.isBnt) {
        this.field.options.script = Base64.encode(this.scriptText);
      } else {
        this.field.options.script = Base64.encode(this.scriptText);
      }
    },
    autoRunJSScript(isBnt) {
      if (isBnt) {
        this.isBnt = true;
      }
      this.dialogScriptVisible = true;
      if (!this.field.options.script) return;
      this.scriptText = Base64.decode(this.field.options.script);
    },
    //关闭联动设置对话框
    closeDialogLinkage() {
      this.dialogLinkageVisible = false;
      this.linkage.length = 0;
    },
    linkageOk() {
      this.dialogLinkageVisible = false;
      Object.assign(this.field.options.linkage, this.linkage);
    },
    addRows() {
      this.linkage.push({
        value: "",
        effect: [
          {
            validateObj: {
              fieldPath: this.field.fieldPath,
              options: {
                validateList: [],
                validate: "",
                validateType:
                  "confirmed|email|regex|min|max|min_value|max_value|isAfter|isBefore|isStart|isEnd|numeric|between|is|digits|mobile|required|alpha_spaces|alpha_dash|alpha_num|alpha|method"
              }
            }
          }
        ]
      });
    },
    openLinkage() {
      if (this.field.options.linkage && this.field.options.linkage.length > 0) {
        Object.assign(this.linkage, this.field.options.linkage);
      } else {
        if (this.linkage.length == 1) {
          this.linkage.length = 0;
        }
      }
      this.dialogLinkageVisible = true;
    },

    //选择单选或复选的动态选项
    setCurrentCustomQuery() {
      const _this = this;
      this.customQuerys.forEach(item => {
        if (this.field.options.customQuery.alias == item.alias) {
          if (typeof item.conditionfield == "string") {
            item.conditionfield = JSON.parse(item.conditionfield); //parseToJson(item.customQuery.conditionfield);
            item.resultfield = JSON.parse(item.resultfield); // parseToJson(item.customQuery.resultfield);
          }
          //把当前对象克隆一份到控件属性配置
          Object.assign(_this.field.options.customQuery, item);
        }
      });
      //删除掉无效的参数
      var bind = [];
      this.field.options.customQuery.conditionfield.forEach(item => {
        if (item.defaultType == 1) {
          bind.push(item);
        }
      });
      this.field.options.bind = bind;
    },
    dynamicClick() {
      this.customQueryUrl = "/form/customQuery/v1/list";
      this.field.options.customQuery = {};
      this.field.options.bind = [];
      this.field.options.options = [];
      if (this.field.options.choiceType == "dynamic") {
        this.field.options.linkage = [];
      }
    },
    afterCustomQueryLoadData(data) {
      this.customQuerys = data.rows;
    },
    afterLoadIdentityData(data) {
      this.identitys = data;
    },
    identityCheck() {
      if (this.field.options.isBindIdentity) {
        this.identityUrl = "/sys/identity/v1/getAll";
      } else {
        this.identityUrl = "";
      }
    },
    isAdvancedProperty(advabcedAttr, alias) {
      if (advabcedAttr && alias) {
        const advabcedAttrs = advabcedAttr.split("|");
        if (advabcedAttrs.includes(alias)) {
          return true;
        } else {
          return false;
        }
      }
      return false;
    },
    isNumberPrefix(){
      if(this.field.ctrlType == 'number' && this.field.options.bindPreAndSufFixjson.preFix){
        this.field.options.width = "90%";
      }
    }
  },
  watch: {
    data: {
      handler(val) {
        this.field = val;
      },
      deep: true,
      immediate: true
    },
    field: {
      handler(val) {
        this.$emit("update:data", val);
      },
      deep: true,
      immediate: true
    }
  }
};
</script>
<style lang="scss" scoped>
@import "@/assets/css/element-variables.scss";
@import "@/assets/css/form-editor.scss";
.btn-radio >>> .el-radio-button__inner {
  padding: 5px 5px;
}
.btn-padding {
  padding: 5px 5px;
}
.btn-radio {
  margin-left: 14px;
}
.btn-radio >>> .el-radio-button__inner {
  padding: 5px 5px;
}
.choiceType-table td {
  padding: 3px;
}
.customQuery-inputs >>> .inputs,
.customQuery-inputs >>> .inputs .el-select {
  width: 100%;
}
.choiceType-bottom .el-form-item {
  margin-bottom: 0px;
}
.linkageTable-tr td {
  text-align: center;
}
.linkage-div-bottom >>> .el-form-item {
  margin-bottom: 0px;
}
</style>
