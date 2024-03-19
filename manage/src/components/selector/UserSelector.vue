<template>
  <div @click="showDialog">
    <el-input
      v-model="fullnames"
      :title="fullnames"
      placeholder="请选择人员"
      readonly
      suffix-icon="icon-account"
      style="width:350px;"
    >
      <!-- <el-button slot="append" @click="showDialog()" icon="icon-account"></el-button> -->
    </el-input>
    <eipUserDialog
      ref="eipUserDialog"
      @onConfirm="onConfirm"
      :single="single"
      :appendToBody="true"
    />
  </div>
</template>
<script>
import eipUserDialog from "@/components/dialog/EipUserDialog.vue";
export default {
  name: "user-selector",
  components: { eipUserDialog },
  props: {
    value: Array | String,
    single: {
      type: Boolean,
      default: false
    }
  },
  data() {
    return {};
  },
  computed: {
    fullnames: function(val) {
      let temp = [];
      if (this.value && this.value.constructor == Array) {
        this.value.forEach(item => {
          temp.push(item.fullname);
        });
      }
      return temp.join(",");
    }
  },
  methods: {
    showDialog() {
      this.$refs.eipUserDialog.showDialog(this.value);
    },
    onConfirm(selection) {
      let result = [];
      if (selection) {
        selection.forEach(item => {
          let obj = {
            id: item.id,
            account: item.account,
            fullname: item.fullname
          };
          result.push(obj);
        });
      }
      // this.fullnames = fullnames.join(",");
      this.$emit("input", result);
    }
  }
};
</script>