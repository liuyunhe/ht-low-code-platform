<template>
  <div>
    <ht-form-item label-width="300px;">
      <draggable
        tag="ul"
        class="column-ul"
        :list="data.options.validateList"
        v-bind="{
          group: { name: 'options' },
          ghostClass: 'ghost',
          handle: '.drag-item'
        }"
        @end="end"
        handle=".drag-item"
      >
        <li v-for="(item, index) in data.options.validateList" :key="index">
          <i class="drag-item icon-draggable"></i>
          <ht-select
            v-model="item.key"
            :options="validateList"
            :props="{ key: 'key', value: 'name' }"
            placeholder="请选择"
            validate="required"
            name="validatorSelect"
            @change="changeValidate(item)"
            style="width: 120px;margin-left: 5px;"
          >
          </ht-select>

          <el-button
            class="el-icon-edit"
            @click="methodClick(index)"
            v-if="item.inputType == 'button'"
            style="margin-left: 5px;"
            >编写方法</el-button
          >
          <ht-input
            @input="appendValidate(item)"
            name="validatorValue"
            v-model="item.start"
            validate="required"
            v-if="item.inputType == 'twoInput'"
            style="width: 60px;margin-left: 5px;"
          />
          <ht-input
            @input="appendValidate(item)"
            name="validatorValue"
            v-model="item.end"
            validate="required"
            v-if="item.inputType == 'twoInput'"
            style="width: 60px;margin-left: 5px;"
          />
          <ht-input
            @input="appendValidate(item)"
            name="validatorValue"
            v-model="item.value"
            validate="required"
            v-if="item.inputType == 'input'"
            style="width: 120px;margin-left: 5px;"
          />
          <ht-select
            :validate="item.key == 'row_unique'?'':required"
            v-model="item.value"
            :options="boData"
            :multiple="item.key == 'row_unique'?true:false"
            :props="{ key: 'name', value: 'desc' }"
            @change="appendValidate(item)"
            name="validatorSelectInput"
            v-if="item.inputType == 'select' || item.key == 'row_unique'"
            style="width: 120px;margin-left: 5px;"
          >
          <el-tooltip  content="多个字段组合进行唯一校验时，字段名用逗号分隔。不填则只校验当前字段">
            <i style="margin-right: -10px;" class="property-tip icon-question" />
          </el-tooltip>
            <template slot-scope="{ options, propKey, propValue }">
              <el-option-group
                v-for="group in options"
                :key="group.name"
                :label="group.desc"
              >
                <el-option
                  v-for="obj in filterBoAttr(group.children)"
                  :key="'data.' + group.path + '.' + obj[propKey]"
                  :label="obj[propValue]"
                  :value="'data.' + group.path + '.' + obj[propKey]"
                ></el-option>
              </el-option-group>
            </template>
          </ht-select>

          <el-button
            v-if="index == requiredIndex"
            circle
            disabled
            plain
            class="grid-remove-button"
            type="danger"
            size="mini"
            icon="el-icon-minus"
          ></el-button>
          <el-button
            v-else
            @click="removeValidata(index)"
            circle
            plain
            class="grid-remove-button"
            type="danger"
            size="mini"
            icon="el-icon-minus"
          ></el-button>
        </li>
      </draggable>
      <div v-if="isAddValidata" style="margin-left: 22px;width:100%">
        <div style="float:left;">
          <el-tooltip effect="light">
                    <div slot="content">
                        <h3>校验规则：</h3>
                        <div style="margin-top: 15px;margin-bottom: 25px;">
                          <span style="color:red">*正则表达式：</span>
                        <span>两个参数，第一个参数为正则表达式，第二个参数为校验未通过时的提示信息</span>
                        <br>
                        <span style="color:red">例如：</span>
                        <span>"^[0-9]+$","校验失败，请输入数字"</span>
                        <br>
                        <span style="color:red">注意：</span>
                        <span>字符串格式的表达式以英文逗号‘,’来分割参数</span>
                        </div>
                    </div>
                    <i class="property-tip icon-question" />
                  </el-tooltip>
          <el-button type="text" @click="addValidata">添加校验规则</el-button>
        </div>
        <div style="float:right">
          <!-- <el-popover
            placement="bottom"
            title="校验规则"
            width="520"
            trigger="hover"
          >
          
            <div style="margin-top: 15px;margin-bottom: 25px;">
              <code>
                <span style="color: red;margin-left: 15px;">*正则表达式：</span>
                <span>两个参数，第一个参数为正则表达式，第二个参数为校验未通过时的提示信息</span>
                <br />
                <span style="color: red;margin-left: 25px;">例如：</span>
                <span>^[0-9]+$,校验失败，请输入数字</span>
                <br />
                <span style="color: red;margin-left: 25px;">注意：</span>
                <span>字符串格式的表达式以英文逗号`,`来分割参数</span>
              </code>
            </div>
            <el-button type="text" slot="reference">规则说明</el-button>
          </el-popover> -->
        </div>
      </div>
    </ht-form-item>

    <el-dialog
      title="方法校验"
      :visible.sync="dialogMethodVisible"
      append-to-body
      class="urgent-text"
      :close-on-click-modal="false"
    >
      <div style="margin-top: 15px;margin-bottom: 25px;">
        <code>
          <span style="color: red;margin-left: 15px;"
            >编辑的脚本内容会直接填充到function(value,data){...}里面；value
            是当前控件输入值 data是表单数据对象</span
          >
          <br />
          <span style="color: red;margin-left: 15px;"
            >如需使用到表单BO数据例：data.实体表名.实体表字段(可以直接选择表单变量)</span
          >
          <br />
          <span style="color: red;margin-left: 15px;"
            >返回true 校验通过 false 校验不通过</span
          >
          <br />
          <span style="color: red;margin-left: 15px;"
            >返回值也可以是一个对象 {valid:true} 或者
            {valid:false,data:{message: i18n.t("login.login") }}
            使用国际化的方式</span
          >
          <br />
          <span style="color: red;margin-left: 15px;"
            >返回值也可以是一个对象 {valid:false,data:{message:
            "身份证号和出生日期不一致，请重新填写" }}</span
          >
          <br />
          <span style="color: red;margin-left: 15px;"
            >例如： if(data.jasonBo.fieldName == value ){ return true; }else{
            return false;}</span
          >
        </code>
      </div>
      <ht-form-item label="表单变量" label-width>
        <ht-select
          clearable
          placeholder="选择表单变量"
          v-model="diyScript"
          :options="boData"
          :props="{ key: 'name', value: 'desc' }"
          @change="diyScriptChange"
        >
          <template slot-scope="{ options }">
            <el-option-group
              v-for="(group, idenx) in options"
              :key="idenx"
              :label="group.desc"
            >
              <el-option
                v-for="item in group.children"
                :key="item.id"
                :label="item.desc"
                :value="'data.' + item.path + '.' + item.name"
              ></el-option>
            </el-option-group>
          </template>
        </ht-select>
      </ht-form-item>
      <div style="width: 100%;height:100%;">
        <codemirror
          ref="scriptText"
          v-model="toolmethod"
          :options="cmOptions"
          class="code"
          style="width: 99%;height:100%;"
        ></codemirror>
      </div>
      <!-- <vue-ueditor-wrap v-model="toolmethod"></vue-ueditor-wrap>-->
      <div slot="footer" class="dialog-footer">
        <el-button type="primary" @click="methodOk()">确 定</el-button>
        <el-button @click="dialogMethodVisible = false">取 消</el-button>
      </div>
    </el-dialog>
  </div>
</template>
<script>
    import Draggable from "vuedraggable";
    import {Base64} from "js-base64";
    import utils from "@/hotent-ui-util.js";
    import {validateRules} from "@/api/controlsConfig.js";

    export default {
  name: "layout-property",
  components: { Draggable },
  props: ["data", "boData", "fieldIndexData"],
  data() {
    return {
      validateRules,
      isAddValidata:true,
      dialogMethodVisible: false,
      methodIndex: 0,
      diyScript: "",
      isFilter: false,
      specialValidate: ["confirmed", "isAfter", "isBefore", "isStart", "isEnd"],
      toolmethod: "",
      cmOptions: {
        value: "",
        mode: "javascript",
        readOnly: false,
        tabSize: 2,
        theme: "base16-light",
        lineNumbers: true,
        line: true
      },
      requiredIndex: -1,
    };
  },
  computed: {
    validateList: function() {
      var rule = this.data.options.validateType;
      if (!rule) {
        return [];
      }
      //判断是否只有一个必填校验规并且选择了必填校验
      if(rule=="required" &&  this.data.options.validate=="'required'"){
        return this.data.options.validateList;
      }
      const filterRule = rule.split("|");
      return this.validateRules.filter(val => {
        var res = true;
        if (filterRule.indexOf(val.key) != -1) {
          if (this.isFilter) {
            const showValidate = this.data.options.validateList.find(function(
              obj
            ) {
              return obj.key == val.key;
            });
            if (showValidate != undefined) {
              res = false;
            }
          }
        } else {
          res = false;
        }
        return res;
      });
    }
  },
  created() {
    this.$validator = this.$root.$validator;
  },
  watch: {
    fieldIndexData: function(newVal){
      if(newVal.fieldName){
        this.data.options.validateList.forEach((v,i) =>{
          if(v.key == "required"){
            this.data.options.validateList.splice(i,1);
          }
        })
        let k = {};
        k.key = "required";
        k.name = "必填";
        this.data.options.validateList.push(k)
        this.changeValidate(k);
      }
      this.requiredIndex = -1;
      for(let i=0; i<this.data.options.validateList.length; i++){
        if(this.data.options.validateList[i].key == "required" && newVal.fieldName){
          this.requiredIndex = i;
          return;
        }else if(this.data.options.validateList[i].key == "required"){
          this.data.options.validateList.splice(i,1);
        }
      }
    }
  },
  methods: {
    async diyScriptChange(myValue) {
      const myField = this.$refs.scriptText;
      var value = myValue;
      if (myField.selectionStart || myField.selectionStart === 0) {
        var startPos = myField.selectionStart;
        var endPos = myField.selectionEnd;
        this.toolmethod =
          myField.value.substring(0, startPos) +
          value +
          myField.value.substring(endPos, myField.value.length);
        await this.$nextTick(); // 这句是重点, 圈起来
        myField.focus();
        myField.setSelectionRange(endPos + value.length, endPos + value.length);
      } else {
        this.toolmethod += value;
      }
    },
    methodOk() {
      this.data.options.validateList[this.methodIndex].value = Base64.encode(
        this.toolmethod
      );
      this.data.options.validate = this.newMergeValidate(
        this.data.options.validateList
      );
      this.dialogMethodVisible = false;
    },
    methodClick(index) {
      this.methodIndex = index;
      this.dialogMethodVisible = true;
      if (!this.data.options.validateList[index].value) return;
      this.toolmethod = Base64.decode(
        this.data.options.validateList[index].value
      );
    },
    handleGridColumnRemove(index) {
      this.data.options.validateList.splice(index, 1);
    },
    filterBoAttr(obj) {
      return obj.filter(val => {
        return val.name != this.data.target;
      });
    },
    end(evt) {
      this.isFilter = false;
      let validateList = this.data.options.validateList;
      this.data.options.validate = this.newMergeValidate(validateList);
    },
    appendValidate(item) {
      let validateList = this.data.options.validateList;
      this.data.options.validate = this.newMergeValidate(validateList);
    },
    changeValidate(item) {
      const showValidate = this.validateRules.find(function(obj) {
        return obj.key == item.key;
      });
      item.inputType = showValidate.inputType;
      item.name = showValidate.name;
      item.isInput = showValidate.isInput;
      item.type = showValidate.type;
      if(this.validateList.length!=1){
        delete item.value;
      }
      if (!item.isInput) {
        let validateList = this.data.options.validateList;
        this.data.options.validate = this.newMergeValidate(validateList);
      }
    },

    addValidata() {
      this.isFilter = true;
      if (!this.data.fieldPath) {
        this.$validator.validateAll("field");
        this.$message.warning("请选择需要修改的组件或绑定属性");
        return;
      }
      this.isAddValidata = true;
      //判断是否只有一个必填校验规
      if(this.data.options.validateType=="required" && this.data.options.validateList.length == 1){
        this.$message.warning("当前选择的控件只有一个必填校验");
        return;
      }
      if (this.data.options.validateList == undefined) {
        this.data.options.validateList = [];
      } else if (this.data.options.validateList.length > 0) {
        const validata = this.data.options.validateList[
          this.data.options.validateList.length - 1
        ];
        if (validata.key == "") {
          this.$validator.validate("field.validatorSelect");
          return;
        } else if (validata.key == "between") {
          if (
            validata.start == undefined ||
            validata.start == "" ||
            validata.end == undefined ||
            validata.end == ""
          ) {
            this.$validator.validate("field.validatorValue");
            return;
          }
        } else if (
          validata.inputType == "select" &&
          (validata.value == undefined || validata.value.length == 0)
        ) {
          this.$validator.validate("field.validatorSelectInput");
          return;
        } else if (
          validata.inputType == "input" &&
          (validata.value == undefined || validata.value.length == 0)
        ) {
          this.$validator.validate("field.validatorValue");
          return;
        } else if (
          validata.inputType == "button" &&
          (validata.value == undefined || validata.value.length == 0)
        ) {
          this.$message.warning("请输入js方法校验");
          return;
        }
      }

      this.$nextTick(() => {
        setTimeout(() => {
          this.data.options.validateList.push({ key: "", name: "" });
        });
      });
    },

    removeValidata(index) {
      this.isFilter = false;
      this.data.options.validateList.splice(index, 1);
      this.data.options.validate = this.newMergeValidate(
        this.data.options.validateList
      );
    },
    getValidate(item) {
      var validate = item.key;
      if (item.isInput) {
        if (item.inputType == "select") {
          if(item.name == "相同的值" || item.name == "日期不晚于" || item.name == "日期晚于"
            || item.name == "日期早于" || item.name == "日期不早于"){
            if(item.value.split(".").length == 4){//子表
              validate = item.key + ":" + "item."+item.value.split(".")[3];
            }else if(item.value.split(".").length == 5){//孙表
              validate = item.key + ":" + "item."+item.value.split(".")[4];
            }else{
              validate = item.key + ":" + item.value;
            }
          }else{
            validate = item.key + ":" + item.value;
          }
        } else if (item.inputType == "input") {
          validate = item.key + ":" + item.value;
        } else if (item.inputType == "twoInput") {
          validate = "between:" + item.start + "," + item.end;
        } else if (item.inputType == "button") {
          validate = item.key + ":" + item.value;
        }
      }
      return validate;
    },
    newMergeValidate(validateList) {
      var ref = false;
      var validateObj1 = "";
      var validateObj2 = [];
      const me_ = this;
      validateList.forEach(obj => {
        const validate = me_.getValidate(obj);
        validateObj2.push(validate);
        const key = utils.stringSplit(validate, ":")[0];
        const value = utils.stringSplit(validate, ":")[1];
        var splitVar = "";
        var op = "";
        if (validateObj1 != "") {
          op = "|";
          splitVar = "+";
        }
        if (me_.specialValidate.indexOf(key) > -1) {
          validateObj1 =
            validateObj1 + splitVar + "'" + op + key + ":'+" + value;
          ref = true;
        } else {
          validateObj1 = validateObj1 + splitVar + "'" + op + validate + "'";
        }
      });
      var validateStr = "";
      if (ref) {
        validateStr = validateObj1;
      } else {
        if (validateObj2.length == 0) {
          validateStr = "";
        }else{
          validateStr = "'" + validateObj2.join("|") + "'";
        }
      }
      return validateStr;
    }
  }
};
</script>
<style lang="scss" scoped>
@import "@/assets/css/form-editor.scss";

.column-ul {
  list-style: none;
  padding: 0;
  margin: 4px -15px 0 0;
}

.column-ul li {
  margin-bottom: 5px;
}

.column-ul .icon-draggable {
  font-weight: bold;
  font-size: 18px;
  cursor: move;
  margin-right: 8px;
}

.grid-remove-button {
  margin-left: 10px;
}

.ghost {
  background: #f56c6c;
  border: 2px solid #f56c6c;
  outline-width: 0;
  height: 3px;
  box-sizing: border-box;
  font-size: 0;
  content: "";
  overflow: hidden;
  padding: 0;
}
</style>
