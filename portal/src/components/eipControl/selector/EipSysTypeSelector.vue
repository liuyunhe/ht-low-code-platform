<template>
  <div class="inputs">
    <ht-input
      :name="inputName"
      ref="htInput"
      v-model="inputVal"
      @focus="showSysTypeDialog"
      @clear="clear"
      :placeholder="placeholder"
      :validate="validate"
    >
      <el-button slot="append" icon="el-icon-search" @click="showSysTypeDialog"></el-button>
    </ht-input>
    <!-- 分类对话框  -->
    <eip-sys-type-dialog
      ref="sysTypeDialog"
      :cat-id="catId"
      :type-key="typeKey"
      @onConfirm="onConfirm"
      append-to-body
    ></eip-sys-type-dialog>
  </div>
</template>
<script>
import utils from "@/hotent-ui-util.js";

const EipSysTypeDialog = () =>
  import("@/components/dialog/EipSysTypeDialog.vue");
export default {
  name: "eip-sys-type-selector",
  components: {
    EipSysTypeDialog
  },
  props: {
    sysTypeId: {
      type: String,
      default: ""
    },
    sysTypeName: {
      type: String,
      default: ""
    },
    catId: {
      type: String,
      default: ""
    },
    typeKey: {
      type: String,
      default: ""
    },
    value: [String, Number, Object],
    validate: {
      type: [String, Object]
    },
    placeholder: {
      type: String,
      default: "请选择分类"
    }
  },
  data() {
    return {};
  },
  computed: {
    inputVal: {
      get() {
        return this.value;
      },
      set(val) {
        this.$emit("input", val);
        // 如果控件本身有name，可能是作为关联字段参与其他字段的校验，所以本字段值变化时立即触发校验。
        if (this.inputName) {
          this.$nextTick(() => {
            this.$validator.validate();
          });
        }
      }
    }
  },
  created() {
    this.$validator = this.$root.$validator;
    this.inputName = this.name ? this.name : Math.random().toString(36).substr(2, 10);
  },
  methods: {
    showSysTypeDialog() {
      this.$refs.sysTypeDialog.showDialog();
    },
    onConfirm(selectedNode) {
      this.$emit("update:sysTypeId",selectedNode.id)
      this.inputVal = selectedNode.name;
      this.$emit("input", selectedNode.name);
      this.$refs.sysTypeDialog.handleClose();
    },
    clear() {
      this.$emit("update:sysTypeId",null)
      this.$emit("input", null);
    }
  }
};
</script>

<style lang="scss" scoped>
div[aria-invalid="true"] >>> .el-input__inner,
div[aria-invalid="true"] >>> .el-input__inner:focus {
  border-color: #f56c6c;
}
</style>
