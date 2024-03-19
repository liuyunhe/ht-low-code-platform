<template>
  <div class="inputs">
    <div style="width: 100%; min-width:180px;" class="el-select" @click="showDialog">
      <div
        ref="tagSpans"
        style="width: calc(100% - 50px);"
        :class="{'el-select__tags_readonly':!inputWriteable, 'el-select__tags':inputWriteable}"
      >
        <span>
          <span
            class="el-tag el-tag--info el-tag--small"
            @click.stop
            v-for="(item,index) in selectors"
            :key="index"
          >
            <span class="el-select__tags-text">{{item.name}}</span>
            <i
              v-if="inputWriteable"
              class="el-tag__close el-icon-close"
              @click="handleRemove(item)"
            ></i>
          </span>
        </span>
      </div>
      <div v-if="inputWriteable">
        <ht-input
          :name="inputName"
          type="text"
          ref="inputEl"
          v-model="name"
          @clear="clear"
          :placeholder="placeholder"
          :validate="inputValidate"
          :style="{height: inputSuffixHeight + 'px'}"
        >
          <el-button slot="append" icon="el-icon-search"></el-button>
        </ht-input>
      </div>
    </div>
    <!-- 数据报表选择对话框  -->
    <eip-data-template-dialog
      ref="eipDataTemplateDialog"
      name="eipDataTemplateDialog"
      @onConfirm="handleDialogSure"
      :single="single"
      append-to-body
    />
  </div>
</template>
<script>
import utils from "@/hotent-ui-util.js";
import { setTimeout } from "timers";
const eipDataTemplateDialog = () => import("@/components/dialog/EipDataTemplateDialog.vue");

export default {
  name: "eip-data-template-selector",
  props: {
    validate: [String, Object],
    value: [String,Object,Array],
    placeholder: {
      type: String,
      default: "请输入内容"
    },
    permission: {
      type: String,
      default: "w",
      validator: function(value) {
        return ["b", "w", "r", "n"].indexOf(value) !== -1;
      }
    },
    single: {
      type: Boolean,
      default: false
    },
    config: Object,
    data: {
      type: Array,
      default: () => {
        return [];
      }
    },
    appendToBody: {
      type: Boolean,
      default: false
    }
  },
  components: {
    eipDataTemplateDialog
  },
  data() {
    return {
      inputName: null,
      inputSuffixHeight: 30,
      name:"",
      selectors: [],
      dialogVisible: false,
      currentDemension: null
    };
  },
  computed: {
    inputWriteable: function() {
      return utils.getWriteable(this.permission);
    },
    inputValidate: function() {
      return utils.addRequiredOrNot(this.permission, this.validate, this);
    }
  },
  watch: {
    // 当所选择的数据发生变化时，同步到v-model中
    selectors: function(newVal) {
      if(newVal && newVal.length>=0 && newVal[0] && newVal[0].name ){
        this.name = newVal[0].name;
      }else{
        this.name = "";
      }
    },
    value: function(newVal) {
      if(this.value && JSON.stringify(newVal) !="{}"){
        if(this.selectors.length>0){
          this.selectors= [];
        }
        this.selectors.push(newVal);
      }else{
        this.selectors= [];
      }
    }
  },
  mounted() {
    // 组件第一次挂载时，同步value到当前所选数据中
    if(this.value && JSON.stringify(this.value) !="{}"){
      this.selectors.push(this.value);
    }else{
      this.selectors= [];
    }
  },
  created() {
    this.inputName = this.name ? this.name : utils.getName();
    this.$validator = this.$root.$validator;
  },
  methods: {
    showDialog() {
      if (!this.inputWriteable) {
        return;
      }
      this.$refs.eipDataTemplateDialog.showDialog(this.selectors);
    },
    handleClose(done) {
      this.$refs.eipDataTemplateDialog.handleClose();
      done && done();
    },
    handleDialogSure(data) {
      this.selectors = data;
      this.$emit("input",this.selectors[0]);
      this.handleClose();
    },
    handleDialogCancel() {
      this.handleClose();
    },
    handleRemove(item) {
      this.selectors.remove(item);
      this.$emit("handleRemove", "");
    },
    clear() {
      this.selectors = [];
    },
    // 更新当前输入框的高度来适配已选数据的高度
    calacInputSuffixHeight() {
      if (!this.$refs.tagSpans) return;
      if (this.$refs.tagSpans.offsetHeight) {
        this.inputSuffixHeight = this.$refs.tagSpans.offsetHeight + 5;
      } else {
        this.inputSuffixHeight = 30;
      }
    }
  }
};
</script>
<style lang="stylus" scoped>
.inputs {
  display: block;
}

.el-select__tags {
  background: #fff;
  margin-left: 1px;
}

.el-select__tags_readonly {
  position: relative;
  top: 50%;
}

.el-input__inner[aria-invalid='true'] {
  border-color: #f56c6c;
}

>>> .el-dialog__header {
  background: #F8F8F8;
  padding: 10px 20px;
  height: 24px;
  line-height: 24px;
  border-bottom: 1px solid #eee;
  border-radius: 2px 2px 0 0;
}

>>> .el-dialog__title {
  font-size: 15px;
  color: #333;
}

>>> .el-dialog__headerbtn {
  top: 14px;
}

>>> .el-dialog__body {
  padding-top: 10px;
  padding-bottom: 10px;
}

>>> .el-main {
  padding-top: 0;
  padding-bottom: 0;
}
</style>
