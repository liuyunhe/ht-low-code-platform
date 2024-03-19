<template>
  <div class="inputs">
    <div style="width: 100%; min-width:180px;" class="el-select" @click="showDialog">
      <div
        ref="tagSpans"
        style="width: calc(100% - 25px);"
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
      <div v-if="inputWriteable" class="el-input el-input--suffix">
        <input
          ref="inputEl"
          type="text"
          readonly="readonly"
          v-validate="inputValidate"
          v-model="value"
          :name="inputName"
          autocomplete="off"
          class="el-input__inner"
          :placeholder="placeholder"
          :style="{height: inputSuffixHeight + 'px'}"
        />
        <span class="el-input__suffix">
          <span class="el-input__suffix-inner">
            <i
              class="el-input__icon icon-department"
              :style="{fontSize:'17px',lineHeight: inputSuffixHeight + 'px'}"
            ></i>
          </span>
        </span>
      </div>
    </div>
    <ht-field-tail :fieldName="inputName" :inputValue="value" />
    <ht-sidebar-dialog
      title="选择岗位"
      :visible="dialogVisible"
      :before-close="handleDialogCancel"
      width="100%"
      :close-on-click-modal="false"
      :append-to-body="appendToBody"
    >
      <el-container>
        <selector
          ref="selector"
          @load="load"
          :data="data"
          :pagination="pagination"
          :table-columns="tableColumns"
          :select-label="selectLabel"
          :single="single"
          :quick-search-props="quickSearchProps"
          search-placeholder="请输入名称、路径查询"
          v-model="selectors"
        />
      </el-container>

      <span slot="footer" class="dialog-footer">
        <el-button type="primary" size="small" @click="handleDialogSure">确 定</el-button>
        <el-button size="small" @click="handleDialogCancel">取 消</el-button>
      </span>
    </ht-sidebar-dialog>
  </div>
</template>
<script>
import utils from "@/hotent-ui-util.js";
import Selector from "@/components/eipControl/selector/common/MobileSelector.vue";
import { setTimeout } from "timers";

export default {
  name: "mobile-post-selector",
  props: {
    demensions: {
      type: Array,
      default: () => {
        return [];
      }
    },
    defaultDemension: {
      type: [String, Number],
      default: ""
    },
    orgs: {
      type: Array,
      default: () => {
        return [];
      }
    },
    loadOrgTree: {
      type: Function
    },
    validate: [String, Object],
    value: String,
    name: String,
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
    tableColumns: {
      type: Array,
      default: () => {
        return [];
      }
    },
    pagination: {
      type: Object,
      default: () => {
        return {
          page: 1,
          pageSize: 10,
          total: 0
        };
      }
    },
    selectLabel: {
      type: String,
      default: "name"
    },
    quickSearchProps: {
      type: String,
      required: true
    },
    nodeKey: {
      type: String,
      default: "id"
    },
    defaultExpandedKeys: {
      type: Array,
      default() {
        return [];
      }
    },
    appendToBody: {
      type: Boolean,
      default: false
    }
  },
  components: {
    Selector
  },
  data() {
    return {
      inputName: null,
      inputSuffixHeight: 30,
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
      let ary = [],
        idAry = [],
        codeAry = [],
        nameAry = [];
      if (newVal && newVal.constructor === Array && newVal.length > 0) {
        newVal.forEach(m => {
          ary.push(m.name);
          if (m.hasOwnProperty("id")) {
            idAry.push(m.id);
          }
          if (m.hasOwnProperty("code")) {
            codeAry.push(m.code);
          }
          if (m.hasOwnProperty("name")) {
            nameAry.push(m.name);
          }
        });
      }
      if (this.config) {
        // 配置了id的绑定关系，则回填到指定属性上
        if (this.config.hasOwnProperty("id")) {
          utils.setValueByConfigKey(this, this.config, "id", idAry.join(","));
        }
        // 配置了code的绑定关系，则回填到指定的属性上
        if (this.config.hasOwnProperty("code")) {
          utils.setValueByConfigKey(
            this,
            this.config,
            "code",
            codeAry.join(",")
          );
        }
        // 配置了name的绑定关系，则回填到指定的属性上
        if (this.config.hasOwnProperty("name")) {
          utils.setValueByConfigKey(
            this,
            this.config,
            "name",
            nameAry.join(",")
          );
        }
      }
      // 通过valueChange事件发布值变更消息
      this.$emit("valueChange", ary.join(","));
      setTimeout(() => {
        this.calacInputSuffixHeight();
        if (this.$refs.inputEl) {
          this.$refs.inputEl.focus();
          this.$refs.inputEl.blur();
        }
      }, 10);
    },
    value: function(newVal) {
      // 父级传递进来的value发生变更时，需要同步到当前所选数据中
      this.valueInit();
    },
    defaultDemension: function(newVal, oldVal) {
      if (newVal && newVal != oldVal) {
        this.currentDemension = newVal;
        this.changeDemension();
      }
    }
  },
  mounted() {
    // 组件第一次挂载时，同步value到当前所选数据中
    this.valueInit();
  },
  created() {
    this.inputName = this.name ? this.name : utils.getName();
    this.$validator = this.$root.$validator;
  },
  methods: {
    // 同步value到当前所选数据中
    valueInit() {
      let tmpAry = [];
      if (this.value) {
        let idAry = [],
          codeAry = [],
          nameAry = [];
        if (this.config) {
          // 配置了id绑定关系，则获取id的值
          if (this.config.hasOwnProperty("id")) {
            let idVal = utils.getValueByConfigKey(this, this.config, "id");
            if (idVal) {
              idAry = idVal.split(",").trim();
            }
          }
          // 配置了name绑定关系，则获取name的值
          if (this.config.hasOwnProperty("name")) {
            let nameVal = utils.getValueByConfigKey(this, this.config, "name");
            if (nameVal) {
              nameAry = nameVal.split(",").trim();
            }
          }

          // 配置了code绑定关系，则获取code的值
          if (this.config.hasOwnProperty("code")) {
            let codeVal = utils.getValueByConfigKey(this, this.config, "code");
            if (codeVal) {
              codeAry = codeVal.split(",").trim();
            }
          }
        }
        // 将name、id、code从逗号分割的字符串解析为json对象格式的数组
        let valAry = this.value.split(",").trim();
        valAry.forEach((m, index) => {
          let item = { name: m };
          if (idAry.length > index) {
            item["id"] = idAry[index];
          }
          if (nameAry.length > index) {
            item["name"] = nameAry[index];
          }
          if (codeAry.length > index) {
            item["code"] = codeAry[index];
          }
          tmpAry.push(item);
        });
      }
      // 对数组做深度对比，如果值不完全相等，则进行赋值操作
      if (!utils.arrayEquals(tmpAry, this.selectors)) {
        this.selectors = tmpAry;
      }
    },
    showDialog() {
      if (!this.inputWriteable) {
        return;
      }
      this.loadDemensions();
      this.dialogVisible = true;
      setTimeout(() => {
        this.$refs.selector.onShow();
      });
    },
    handleClose(done) {
      this.$refs.selector.onHide();
      done && done();
    },
    handleDialogSure() {
      this.dialogVisible = false;
      this.$refs.selector.onHide(true);
    },
    handleDialogCancel() {
      this.dialogVisible = false;
      this.$refs.selector.onHide();
    },
    handleRemove(item) {
      this.selectors.remove(item);
    },
    // 更新当前输入框的高度来适配已选数据的高度
    calacInputSuffixHeight() {
      if (!this.$refs.tagSpans) return;
      if (this.$refs.tagSpans.offsetHeight) {
        this.inputSuffixHeight = this.$refs.tagSpans.offsetHeight + 5;
      } else {
        this.inputSuffixHeight = 30;
      }
    },
    load(param, cb) {
      this.$emit("load", param, cb);
    },
    changeDemension() {
      this.$emit("changeDemension", this.currentDemension);
    },
    handleNodeClick(data) {
      this.$emit("loadPosts", data);
    },
    loadDemensions() {
      this.$emit("loadDemensions");
    }
  }
};
</script>
<style lang="stylus" scoped>
>>> .el-header {
  padding-right: 0px !important;
  padding-left: 5px;
  -webkit-box-sizing: border-box;
  box-sizing: border-box;
  -ms-flex-negative: 0;
  flex-shrink: 0;
}

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
  top: 12px;
}

>>> .el-main {
  padding-top: 0;
  padding-bottom: 0;
}

>>>.el-dialog__body {
  height: calc(100% - 90px) !important;
  padding: 0;
}
</style>
