<template>
  <div class="inputs">
    <ht-input
      ref="htInput"
      v-model="inputVal"
      @focus="showChartDialog"
      @clear="clear"
      :placeholder="placeholder"
    >
      <el-button slot="append" icon="el-icon-search" @click="showChartDialog">图表</el-button>
    </ht-input>
    <eip-chart-dialog ref="chartDialog" @onConfirm="onConfirm" append-to-body :chartType="chartType"></eip-chart-dialog>
  </div>
</template>
<script>
import utils from "@/hotent-ui-util.js";
const EipChartDialog = () => import("@/components/dialog/EipChartDialog.vue");
export default {
  name: "eip-chart-selector",
  components: {EipChartDialog},
  props: {
    dataParam:{
      type:String
    },
    chartType:{
      type:Number,
      default:1
    }
  },
  data() {
    return {
      placeholder:'请选择图表'
    };
  },
  computed: {
     inputVal: {
      get() {
        let obj = JSON.parse(this.dataParam||"{}");
        if(obj instanceof Array){
          return '';
        }
        return obj && obj.name ||'';
      },
      set(val) {
        // this.$emit("input", val);
        // // 如果控件本身有name，可能是作为关联字段参与其他字段的校验，所以本字段值变化时立即触发校验。
        // if (this.inputName) {
        //   this.$nextTick(() => {
        //     this.$validator.validate();
        //   });
        // }
      }
    }
  },
  created() {
  },
  methods: {
    showChartDialog() {
      this.$refs.chartDialog.showDialog();
    },
    onConfirm(selectedNode) {
      let dataParam = {
        id: selectedNode[0].id,
        name: selectedNode[0].name
      };;
      dataParam.chartType = this.chartType;
      this.$emit("update:dataParam",JSON.stringify(dataParam));
      this.$refs.chartDialog.handleClose();
    },
    clear(){
      this.$emit("update:dataParam",'');
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
